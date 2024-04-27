import tkinter as tk
import json

def save_data():
    color = card_color.get()
    data = {
        "Text": text.get(),
        "Pack": pack.get(),
        "Credit": credit.get() if activate_credit.get() else None,
        "Credit-Platform": credit_platform.get() if activate_credit.get() else None
    }

    # Check if all required fields are filled
    if color and data["Text"] and (not activate_credit.get() or (data["Credit"] and data["Credit-Platform"])):
        # Load existing data from the JSON file, if it exists
        try:
            with open("Cards/cards.json", "r") as f:
                existing_data = json.load(f)
                print("file found")
        except FileNotFoundError:
            print("Cards.json not found")
            existing_data = {"WhiteCards": [], "BlackCards": []}

        try:
            with open("Cards/userSubmittedCards.json", "r") as p:
                backup_existing_data = json.load(p)
                print("file found")
        except FileNotFoundError:
            print("userSubmittedCards.json not found")
            backup_existing_data = {"WhiteCards": [], "BlackCards": []}

        # Determine which array to append the new data to based on card color
        if color == "White":
            existing_data["WhiteCards"].append(data)
            backup_existing_data["WhiteCards"].append(data)
        elif color == "Black":
            existing_data["BlackCards"].append(data)
            backup_existing_data["BlackCards"].append(data)

        # Write the updated data back to the JSON file
        with open("Cards/cards.json", "w") as f:
            json.dump(existing_data, f, indent=4)
            print('main file written')

        with open("Cards/userSubmittedCards.json", "w") as p:
            json.dump(existing_data, p, indent=4)
            print('backup file written')

        # Clear input fields after submission
        text.set("")
    else:
        # Display error message if not all required fields are filled
        tk.messagebox.showerror("Error", "Please fill in all required fields.")

# Create main window
root = tk.Tk()
root.title("Add Card Util")

# Create variables for input fields
card_color = tk.StringVar()
text = tk.StringVar()
pack = tk.StringVar()
credit = tk.StringVar()
credit_platform = tk.StringVar()
activate_credit = tk.BooleanVar()

# Create form elements
tk.Label(root, text="Card Color").grid(row=0, column=0)
tk.OptionMenu(root, card_color, "White", "Black").grid(row=0, column=1)
tk.Label(root, text="Text").grid(row=1, column=0)
tk.Entry(root, textvariable=text).grid(row=1, column=1)
tk.Label(root, text="Pack").grid(row=2, column=0)
tk.Entry(root, textvariable=pack).grid(row=2, column=1)
tk.Checkbutton(root, text="Add Card Credit", variable=activate_credit).grid(row=3, columnspan=2)
tk.Label(root, text="Credit").grid(row=4, column=0)
credit_entry = tk.Entry(root, textvariable=credit)
credit_entry.grid(row=4, column=1)
tk.Label(root, text="Credit Platform").grid(row=5, column=0)
credit_platform_options = ["Instagram", "Twitter/X"]
credit_platform_dropdown = tk.OptionMenu(root, credit_platform, *credit_platform_options)
credit_platform_dropdown.grid(row=5, column=1)

# Disable credit inputs initially
credit_entry.config(state=tk.DISABLED)
credit_platform_dropdown.config(state=tk.DISABLED)

# Function to toggle credit inputs
def toggle_credit_inputs():
    if activate_credit.get():
        credit_entry.config(state=tk.NORMAL)
        credit_platform_dropdown.config(state=tk.NORMAL)
    else:
        credit_entry.config(state=tk.DISABLED)
        credit_platform_dropdown.config(state=tk.DISABLED)

# Bind toggle_credit_inputs to checkbox state change
activate_credit.trace_add("write", lambda *args: toggle_credit_inputs())

# Create button to save data
tk.Button(root, text="Add Card", command=save_data).grid(row=6, columnspan=2)

root.mainloop()
