item_list = ['A', 'B', 'C', 'C', 'D', 'C', 'D']
item_set = set(item_list)
item_most_common = [(item, item_list.count(item)) for item in item_list]

print(item_most_common)