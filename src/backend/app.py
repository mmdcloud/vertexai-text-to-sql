# app_cloudsql.py
from flask import Flask, request, jsonify
from vertexai.preview.language_models import TextGenerationModel
import psycopg2
import os
import re

app = Flask(__name__)

# Vertex AI LLM
model = TextGenerationModel.from_pretrained("text-bison@001")

# Cloud SQL connection parameters
DB_HOST = os.getenv("DB_HOST", "your-cloudsql-ip")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "mydb")

# Define database schema for LLM
SCHEMA_DESCRIPTION = """
You are an assistant that converts natural language to SQL.
Database: PostgreSQL
Tables:
1. customers(customer_id, name, country, signup_date)
2. orders(order_id, customer_id, product, amount, order_date)
Foreign Keys:
- orders.customer_id → customers.customer_id
"""

# Whitelist keywords to prevent dangerous queries
SQL_WHITELIST = ["SELECT", "FROM", "WHERE", "JOIN", "ON", "GROUP BY", "ORDER BY", "LIMIT", "SUM", "COUNT", "AVG", "MAX", "MIN"]

def is_sql_safe(sql_query: str):
    sql_upper = sql_query.upper()
    # Ensure only SELECT queries
    if not sql_upper.strip().startswith("SELECT"):
        return False
    # Optional: ensure only allowed keywords are present
    return all(word in sql_upper or re.search(r"\b{}\b".format(word), sql_upper) for word in SQL_WHITELIST)

@app.route("/query", methods=["POST"])
def query():
    data = request.json
    user_query = data.get("query", "")
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    # Vertex AI prompt
    prompt = f"""
{SCHEMA_DESCRIPTION}
User request: {user_query}
Output only SQL query compatible with PostgreSQL:
"""
    response = model.predict(prompt, max_output_tokens=500)
    generated_sql = response.text.strip()

    if not is_sql_safe(generated_sql):
        return jsonify({"error": "Generated SQL failed safety check", "sql": generated_sql}), 400

    try:
        # Connect to Cloud SQL
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cur = conn.cursor()
        cur.execute(generated_sql)
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in rows]
        cur.close()
        conn.close()
        return jsonify({"sql": generated_sql, "results": results})
    except Exception as e:
        return jsonify({"error": str(e), "sql": generated_sql}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)