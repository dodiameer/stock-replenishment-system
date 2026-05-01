# AI-Powered Stock Replenishment System

## 📌 Project Overview

This project is a Minimum Viable Product (MVP) for an intelligent supply chain management system. It leverages a Multi-Agent Artificial Intelligence architecture to automate the evaluation of low-stock inventory and intelligently determine optimal reorder quantities based on historical data, budget constraints, and business rules.

## 🎯 The Problem

Traditional supply chain management requires human operators to manually monitor stock levels, cross-reference historical sales trends, and verify budgets before placing supplier orders. This process is time-consuming, prone to human error, and struggles to scale dynamically.

## 💡 The Solution

We are building a decoupled, full-stack application that replaces the manual review process with an AI consensus mechanism. When an item falls below its safety stock threshold, the system triggers a team of AI agents to evaluate the situation and propose a data-backed reorder decision to a human manager.

## 🏗️ System Architecture

The project is divided into three core components:

1. **The User Interface (Frontend):**
   A dashboard for human managers to view low-stock alerts, read the AI's reasoning logs, and ultimately approve or reject the suggested reorder quantities.

2. **The Data Server (Backend):**
   A fast, RESTful API (built with FastAPI) that serves the product catalog and historical time-series sales data to both the frontend UI and the AI engine.

3. **The AI Engine (Multi-Agent System):**
   Powered by CrewAI, this system consists of specialized AI personas working in tandem:
   - **The Forecaster:** Analyzes 90-day historical sales data to predict immediate future demand.
   - **The Budget Controller:** Evaluates unit prices and supplier constraints to ensure financial viability.
   - **The Manager:** Synthesizes the data, applies Retrieval-Augmented Generation (RAG) against company policy documents, and outputs the final reorder recommendation.
