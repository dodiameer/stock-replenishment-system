import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process

# Import the specific tool for reading our policy file
from crewai_tools import FileReadTool

# Load the API keys from the .env file
load_dotenv()

# Define our model constant
MODEL = 'groq/llama-3.3-70b-versatile'

def evaluate_inventory(item_dict, sales_list):
    """
    Takes the catalog data and sales history, runs the AI debate,
    consults the company policy (RAG), and returns a suggested reorder quantity.
    """
    
    # Initialize the RAG Tool pointing exactly to our new document
    policy_tool = FileReadTool(file_path='grocery-data/company_policy.txt')
    
    #Define the Agents
    forecaster = Agent(
        role='Demand Forecaster',
        goal='Analyze 90-day sales history and predict required stock for the next 30 days.',
        backstory='You are a veteran supply chain analyst who spots trends in time-series data.',
        verbose=True,
        llm=MODEL,
        allow_delegation=False
    )

    budget_controller = Agent(
        role='Budget Controller',
        goal='Evaluate the financial viability of stock orders based on unit price and max capacity.',
        backstory='You are a strict financial officer who prevents overspending and warehouse overflow.',
        verbose=True,
        llm=MODEL,
        allow_delegation=False
    )

    manager = Agent(
        role='Supply Chain Manager',
        goal='Review the forecaster and budget reports, then consult the company policy to make the final executive decision on exactly how many units to reorder.',
        backstory='You are the final decision-maker. You ALWAYS read the company policy document before finalizing any numbers to ensure strict compliance.',
        verbose=True,
        llm=MODEL,
        allow_delegation=False,
        tools=[policy_tool] #hand the tool specifically to the Manager
    )

    #Define the Tasks
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
        description=f"""Review the financial summary. 
        The supplier for this specific item is: {item_dict.get('Supplier_Name', 'Unknown')}.
        
        You MUST use your FileReadTool to read the company policy document. 
        Cross-reference the item details and the supplier name against the policy rules (like perishable limits, financial caps, or supplier MOQs).
        
        CRITICAL MATH REQUIREMENT: Before determining the final number, you must explicitly calculate:
        1. The exact capacity limit based on the policy rules.
        2. The sum of the current stock ({item_dict['Stock_Quantity']}) plus your proposed order.
        3. Verify that this sum is strictly less than or equal to the capacity limit.
        
        Determine the final, exact integer quantity of units to reorder. 
        Output ONLY a JSON string containing two keys: 'suggested_order_quantity' (an integer) and 'reasoning_log' (a brief explanation string detailing exactly which policy rules you applied).""",
        expected_output="A strictly formatted JSON string with the final order quantity and a reasoning log that explicitly mentions the policy.",
        agent=manager
    )

    #Assemble and Run the Crew
    replenishment_crew = Crew(
        agents=[forecaster, budget_controller, manager],
        tasks=[analyze_demand, evaluate_finances, final_decision],
        process=Process.sequential
    )

    # Kick off the debate
    result = replenishment_crew.kickoff()
    
    return result