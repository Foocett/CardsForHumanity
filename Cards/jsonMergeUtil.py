import tkinter as tk
from tkinter import filedialog
import json


def merge_data():
    # Open file dialog to select JSON file
    filepath = filedialog.askopenfilename(filetypes=[("JSON Files", "*.json")])
    if not filepath:
        return

    try:
        # Load data from selected JSON file
        with open(filepath, "r") as f:
            new_data = json.load(f)
    except Exception as e:
        tk.messagebox.showerror("Error", f"Error loading JSON file: {e}")
        return

    # Load existing data from the main JSON file
    try:
        with open("Cards/cards.json", "r") as f:
            existing_data = json.load(f)
    except FileNotFoundError:
        tk.messagebox.showerror("Error", "Main JSON file not found.")
        return

    # Append new data to existing data
    existing_data["WhiteCards"].extend(new_data["WhiteCards"])
    existing_data["BlackCards"].extend(new_data["BlackCards"])

    # Write the merged data back to the main JSON file
    try:
        with open("Cards/cards.json", "w") as f:
            json.dump(existing_data, f, indent=4)
        tk.messagebox.showinfo("Success", "Data merged successfully.")
    except Exception as e:
        tk.messagebox.showerror("Error", f"Error writing merged data to file: {e}")


# Create main window
root = tk.Tk()
root.title("Merge JSON Data")

# Create button to merge data
tk.Button(root, text="Merge Data", command=merge_data).pack()

root.mainloop()
