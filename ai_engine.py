import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Load the API keys from the .env file
MODEL = 'groq/llama-3.3-70b-versatile'

load_dotenv()

def evaluate_inventory(item_dict, sales_list):
    """
    Takes the catalog data and sales history, runs the AI debate,
    and returns a suggested reorder quantity.
    """
    # --- 1. Define the Agents ---
    forecaster = Agent(
        role='Demand Forecaster',
        goal='Analyze 90-day sales history and predict required stock for the next 30 days.',
        backstory='You are a veteran supply chain analyst who spots trends in time-series data.',
        verbose=True,
        llm= MODEL, 
        allow_delegation=False
    )

    budget_controller = Agent(
        role='Budget Controller',
        goal='Evaluate the financial viability of stock orders based on unit price and max capacity.',
        backstory='You are a strict financial officer who prevents overspending and warehouse overflow.',
        verbose=True,
        llm= MODEL,  
        allow_delegation=False
    )

    manager = Agent(
        role='Supply Chain Manager',
        goal='Review the forecaster and budget reports to make the final executive decision on exactly how many units to reorder.',
        backstory='You are the final decision-maker. You balance demand needs with budget constraints to output a single, definitive number.',
        verbose=True,
        llm= MODEL, 
        allow_delegation=False
    )

    # --- 2. Define the Tasks ---
    analyze_demand = Task(
        description=f"Analyze the following 90-day sales history for {item_dict['Product_Name']}: {sales_list}. Calculate the average daily sales and project the demand for the next 30 days.",
        expected_output="A short report detailing the daily average sales and the projected 30-day demand.",
        agent=forecaster
    )

    evaluate_finances = Task(
        description=f"Review the demand projection. The item costs ${item_dict['Unit_Price']} per unit. The warehouse max capacity for this item is {item_dict['Max_Capacity']} units. Current stock is {item_dict['Stock_Quantity']}. Calculate the cost of the proposed order and warn if it exceeds capacity.",
        expected_output="A financial summary approving or modifying the projected order based on cost and capacity limits.",
        agent=budget_controller
    )

    final_decision = Task(
        description="Review the financial summary. Determine the final, exact integer quantity of units to reorder. Output ONLY a JSON string containing two keys: 'suggested_order_quantity' (an integer) and 'reasoning_log' (a brief explanation string).",
        expected_output="A strictly formatted JSON string with the final order quantity and reasoning.",
        agent=manager
    )

    # --- 3. Assemble and Run the Crew ---
    replenishment_crew = Crew(
        agents=[forecaster, budget_controller, manager],
        tasks=[analyze_demand, evaluate_finances, final_decision],
        process=Process.sequential
    )

    # Kick off the debate
    result = replenishment_crew.kickoff()
    
    return result