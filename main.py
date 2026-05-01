from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

# Initialize the server
app = FastAPI(title="Stock Replenishment API")

# Allow the frontend to talk to this backend without security blocks (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File paths 
CATALOG_PATH = "grocery-data/cleaned_catalog.csv"
SALES_PATH = "grocery-data/historical_sales.csv"

# This defines what the frontend must send
class StockEvaluationRequest(BaseModel):
    sku: str

@app.get("/api/inventory/low-stock")
def get_low_stock():
    # 1. Load the catalog
    df = pd.read_csv(CATALOG_PATH)
    
    # 2. Drop the noise in memory (Data Minimization)
    if 'Sales_Volume' in df.columns:
        df = df.drop(columns=['Sales_Volume'])
        
    # 3. Find items where stock is below the reorder level
    low_stock_df = df[df['Stock_Quantity'] < df['Reorder_Level']]
    
    # 4. Format the output to perfectly match the API Contract
    items = []
    for _, row in low_stock_df.iterrows():
        items.append({
            "sku": str(row['Product_ID']),
            "name": str(row['Product_Name']),
            "current_stock": int(row['Stock_Quantity']),
            "threshold": int(row['Reorder_Level'])
        })
        
    return {"items": items}

@app.post("/api/evaluate-stock")
def evaluate_stock(request: StockEvaluationRequest):
    # 1. Load both datasets
    catalog_df = pd.read_csv(CATALOG_PATH)
    sales_df = pd.read_csv(SALES_PATH)
    
    # 2. Find the exact item the frontend asked for
    item_data = catalog_df[catalog_df['Product_ID'] == request.sku]
    item_sales = sales_df[sales_df['Product_ID'] == request.sku]
    
    if item_data.empty:
        return {"error": "Item not found in catalog"}
        
    # 3. Convert the data into Python dictionaries so the AI can read it easily
    item_dict = item_data.drop(columns=['Sales_Volume'], errors='ignore').to_dict('records')[0]
    sales_list = item_sales.to_dict('records')
    
    # --- CREW AI LOGIC WILL GO HERE LATER ---
    # For now, we return dummy data matching our API contract
    
    return {
        "sku": request.sku,
        "suggested_order_quantity": 50,
        "reasoning_log": f"Data retrieved for {item_dict['Product_Name']}. Waiting for AI agents to be connected.",
        "policy_referenced": "Pending RAG integration."
    }