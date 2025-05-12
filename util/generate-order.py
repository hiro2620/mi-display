import random
import csv
import argparse
import math

def generate_order_csv(num_rows, max_task_id, output_file='order.csv'):
    """
    Generate a CSV file with columns 'order' and 'task_id'.
    Each task_id appears with equal frequency.
    
    Args:
        num_rows (int): Number of rows to generate
        max_task_id (int): Maximum value for task_id
        output_file (str): Name of the output CSV file
    """
    # Validate inputs
    if num_rows <= 0:
        raise ValueError("Number of rows must be positive")
    if max_task_id <= 0:
        raise ValueError("Maximum task ID must be positive")
    
    # Calculate how many times each task_id should appear
    repetitions = math.ceil(num_rows / max_task_id)
    
    # Create a list where each task_id appears exactly 'repetitions' times
    task_ids = []
    for task_id in range(1, max_task_id + 1):
        task_ids.extend([task_id] * repetitions)
    
    # Shuffle to randomize the order
    random.shuffle(task_ids)
    
    # Trim to the exact number of rows needed
    task_ids = task_ids[:num_rows]
    
    # Create the data
    data = [{"order": i+1, "task_id": task_id} 
            for i, task_id in enumerate(task_ids)]
    
    # Write to CSV file
    with open(output_file, 'w', newline='') as csvfile:
        fieldnames = ['order', 'task_id']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in data:
            writer.writerow(row)
    
    print(f"CSV file '{output_file}' has been created successfully.")
    print(f"Each task_id appears approximately {num_rows/max_task_id:.2f} times on average.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a CSV file with order and task_id columns")
    parser.add_argument("num_rows", type=int, help="Number of rows to generate")
    parser.add_argument("max_task_id", type=int, help="Maximum value for task_id")
    parser.add_argument("--output", "-o", type=str, default="order.csv", 
                        help="Output CSV filename (default: order.csv)")
    
    args = parser.parse_args()
    
    generate_order_csv(args.num_rows, args.max_task_id, args.output)