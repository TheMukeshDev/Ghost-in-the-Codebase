def process_data(data):
    # FIXME: Handle edge cases
    result = []
    for item in data:
        result.append(item * 2)
    return result

def calculate_total(items):
    total = 0
    for item in items:
        total += item.get('price', 0)
    return total
