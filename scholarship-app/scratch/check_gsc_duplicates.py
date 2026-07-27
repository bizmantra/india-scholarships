import openpyxl
import requests
import urllib3
import re

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_canonical(url):
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        r = requests.get(url, headers=headers, timeout=10, verify=False)
        html = r.text
        
        # Search for canonical link in HTML
        match = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', html)
        if match:
            return match.group(1)
        return "MISSING"
    except Exception as e:
        return f"ERROR: {str(e)}"

def main():
    wb = openpyxl.load_workbook('tmp/gsc_duplicates.xlsx')
    rows = list(wb['Table'].iter_rows(values_only=True))[1:] # skip header
    urls = [r[0] for r in rows if r[0]]
    
    print("Checking canonical tags of first 15 URLs from the duplicates spreadsheet:")
    for url in urls[:15]:
        canonical = get_canonical(url)
        print(f"\nURL: {url}")
        print(f"Canonical: {canonical}")

if __name__ == "__main__":
    main()
