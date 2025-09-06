import re

def validate_yearly_dates(dates_list):
    """
    Validate yearly routine dates format.
    Each date should be in MM-DD format where:
    - Month is 01-12 (padded to 2 digits)
    - Day is valid for the given month (01-31 for most months, 01-30 for Apr/Jun/Sep/Nov, 01-29 for Feb)
    """
    if not isinstance(dates_list, list):
        return False, "Dates must be a list"
    
    if not dates_list:
        return False, "At least one date must be provided"
    
    for date_str in dates_list:
        if not isinstance(date_str, str):
            return False, f"Date must be a string, got {type(date_str)}"
        
        # Check format MM-DD
        if not re.match(r'^\d{2}-\d{2}$', date_str):
            return False, f"Date must be in MM-DD format, got: {date_str}"
        
        try:
            month = int(date_str[:2])
            day = int(date_str[3:])
        except ValueError:
            return False, f"Invalid date format: {date_str}"
        
        # Validate month
        if month < 1 or month > 12:
            return False, f"Month must be between 01-12, got: {month:02d}"
        
        # Validate day based on month
        if month in [1, 3, 5, 7, 8, 10, 12]:  # 31-day months
            max_day = 31
        elif month in [4, 6, 9, 11]:  # 30-day months
            max_day = 30
        else:  # February
            max_day = 29
        
        if day < 1 or day > max_day:
            return False, f"Day must be between 01-{max_day:02d} for month {month:02d}, got: {day:02d}"
    
    return True, "Valid"