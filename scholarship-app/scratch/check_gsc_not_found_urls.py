import openpyxl
import requests
import urllib3
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def check_url(url):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        r_init = requests.get(url, headers=headers, allow_redirects=False, timeout=10, verify=False)
        status_init = r_init.status_code
        location = r_init.headers.get("Location", "")
        
        r_final = requests.get(url, headers=headers, allow_redirects=True, timeout=10, verify=False)
        status_final = r_final.status_code
        url_final = r_final.url
        
        return {
            "url": url,
            "status_init": status_init,
            "location": location,
            "status_final": status_final,
            "url_final": url_final,
            "error": None
        }
    except Exception as e:
        return {
            "url": url,
            "status_init": 0,
            "location": "",
            "status_final": 0,
            "url_final": "",
            "error": str(e)
        }

def main():
    wb = openpyxl.load_workbook('tmp/gsc_not_found.xlsx')
    rows = list(wb['Table'].iter_rows(values_only=True))[1:] # skip header
    urls = [r[0] for r in rows if r[0]]
    print(f"Total URLs to check: {len(urls)}")
    
    results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_url = {executor.submit(check_url, url): url for url in urls}
        
        count = 0
        for future in as_completed(future_to_url):
            res = future.result()
            results.append(res)
            count += 1
            if count % 20 == 0:
                print(f"Checked {count}/{len(urls)} URLs...")
                
    # Group results
    status_init_counts = {}
    status_final_counts = {}
    
    redirect_details = []
    ok_details = []
    not_found_details = []
    error_details = []
    
    for r in results:
        init = r["status_init"]
        final = r["status_final"]
        status_init_counts[init] = status_init_counts.get(init, 0) + 1
        status_final_counts[final] = status_final_counts.get(final, 0) + 1
        
        if r["error"]:
            error_details.append(r)
        elif init in (301, 302, 307, 308):
            redirect_details.append(r)
        elif final == 200:
            ok_details.append(r)
        elif final == 404:
            not_found_details.append(r)
        else:
            error_details.append(r)
            
    print("\n--- RESULTS SUMMARY ---")
    print(f"Total URLs: {len(urls)}")
    print("\nInitial Status Codes (Before Redirects):")
    for status, cnt in sorted(status_init_counts.items()):
        print(f"  {status}: {cnt}")
        
    print("\nFinal Status Codes (After Redirects):")
    for status, cnt in sorted(status_final_counts.items()):
        print(f"  {status}: {cnt}")
        
    print(f"\nBreakdown:")
    print(f"  Redirects (3xx): {len(redirect_details)}")
    print(f"  OK (200): {len(ok_details)}")
    print(f"  Not Found (404): {len(not_found_details)}")
    print(f"  Errors/Other: {len(error_details)}")
    
    # Save detailed report to file
    with open("tmp/gsc_not_found_url_check_report.txt", "w") as f:
        f.write(f"GSC Not Found (404) URLs Check Report\n")
        f.write(f"Total Checked: {len(urls)}\n\n")
        
        f.write("=== 200 OK URLs ===\n")
        for r in ok_details:
            f.write(f"{r['url']}\n")
            
        f.write("\n=== REDIRECTED URLs ===\n")
        for r in redirect_details:
            f.write(f"{r['url']} -> (Initial: {r['status_init']}) -> {r['location']} (Final: {r['status_final']} at {r['url_final']})\n")
            
        f.write("\n=== 404 NOT FOUND URLs ===\n")
        for r in not_found_details:
            f.write(f"{r['url']}\n")
            
        f.write("\n=== ERRORS / OTHER ===\n")
        for r in error_details:
            f.write(f"{r['url']} (Err: {r['error']}, Final status: {r['status_final']})\n")

if __name__ == "__main__":
    main()
