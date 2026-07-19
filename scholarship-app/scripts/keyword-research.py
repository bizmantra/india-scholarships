import argparse
import sys
import csv
import os
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

def main(client, customer_id, keyword_texts):
    keyword_plan_idea_service = client.get_service("KeywordPlanIdeaService")
    
    # Configure the query parameters
    request = client.get_type("GenerateKeywordIdeasRequest")
    request.customer_id = customer_id
    
    # Set Language (English = "1000")
    request.language = client.get_service("GeoTargetConstantService").geo_target_constant_path("1000")
    
    # Set Geo Target (India = "2356")
    request.geo_target_constants.append(
        client.get_service("GeoTargetConstantService").geo_target_constant_path("2356")
    )
    
    request.keyword_and_url_seed.keywords.extend(keyword_texts)
    request.keyword_plan_network = client.enums.KeywordPlanNetworkEnum.GOOGLE_SEARCH
    
    print(f"Requesting keyword ideas from Google Keyword Planner for: {keyword_texts}...")
    try:
        keyword_ideas = keyword_plan_idea_service.generate_keyword_ideas(request=request)
        
        # Save to CSV
        os.makedirs("Keyword research", exist_ok=True)
        csv_filename = "Keyword research/keyword_ideas_report.csv"
        
        with open(csv_filename, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Keyword", 
                "Avg Monthly Searches", 
                "Competition", 
                "Low Bid (INR)", 
                "High Bid (INR)"
            ])
            
            count = 0
            for idea in keyword_ideas:
                metrics = idea.keyword_idea_metrics
                avg_searches = metrics.avg_monthly_searches if metrics.avg_monthly_searches else 0
                competition = metrics.competition.name if metrics.competition else "UNKNOWN"
                
                low_bid = metrics.low_top_of_page_bid_micros / 1000000 if metrics.low_top_of_page_bid_micros else 0
                high_bid = metrics.high_top_of_page_bid_micros / 1000000 if metrics.high_top_of_page_bid_micros else 0
                
                writer.writerow([
                    idea.text,
                    avg_searches,
                    competition,
                    low_bid,
                    high_bid
                ])
                count += 1
                
        print(f"Success! Report generated: {csv_filename} (Retrieved {count} keyword ideas)")
        
    except GoogleAdsException as ex:
        print(f"Request with ID '{ex.request_id}' failed with status "
              f"'{ex.error.code}' and includes the following errors:")
        for error in ex.failure.errors:
            print(f"\tError with message: {error.message}")
            if error.location:
                for field_path_element in error.location.field_path_elements:
                    print(f"\t\tOn field: {field_path_element.field_name}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query Keyword Planner ideas")
    parser.add_argument("-c", "--customer_id", required=True, help="10-digit Google Ads Customer ID (without hyphens)")
    parser.add_argument("-k", "--keywords", required=True, help="Comma-separated list of keywords")
    args = parser.parse_args()
    
    # Load configuration from google-ads.yaml in the root directory
    googleads_client = GoogleAdsClient.load_from_storage(path="google-ads.yaml")
    
    keyword_list = [k.strip() for k in args.keywords.split(",")]
    main(googleads_client, args.customer_id.replace("-", ""), keyword_list)
