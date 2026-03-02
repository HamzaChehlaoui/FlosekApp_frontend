import { Injectable } from '@angular/core';

export interface IconOption {
  icon: string;   // Material Symbols icon name
  label: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class IconService {

  private readonly iconCategories: Record<string, { icon: string; label: string }[]> = {
    'Food & Drinks': [
      { icon: 'restaurant', label: 'Restaurant' },
      { icon: 'coffee', label: 'Coffee' },
      { icon: 'local_pizza', label: 'Fast Food' },
      { icon: 'icecream', label: 'Desserts' },
      { icon: 'local_bar', label: 'Drinks' },
      { icon: 'local_grocery_store', label: 'Groceries' },
      { icon: 'bakery_dining', label: 'Bakery' },
      { icon: 'lunch_dining', label: 'Lunch' },
    ],

    'Transport': [
      { icon: 'directions_car', label: 'Car' },
      { icon: 'local_gas_station', label: 'Fuel' },
      { icon: 'directions_bus', label: 'Bus' },
      { icon: 'train', label: 'Train' },
      { icon: 'local_taxi', label: 'Taxi' },
      { icon: 'flight', label: 'Flight' },
      { icon: 'local_parking', label: 'Parking' },
      { icon: 'two_wheeler', label: 'Motorcycle' },
    ],

    'Shopping': [
      { icon: 'shopping_cart', label: 'General' },
      { icon: 'checkroom', label: 'Clothing' },
      { icon: 'devices', label: 'Electronics' },
      { icon: 'card_giftcard', label: 'Gifts' },
      { icon: 'storefront', label: 'Store' },
      { icon: 'diamond', label: 'Jewelry' },
      { icon: 'watch', label: 'Accessories' },
    ],

    'Bills': [
      { icon: 'home', label: 'Rent' },
      { icon: 'bolt', label: 'Electricity' },
      { icon: 'water_drop', label: 'Water' },
      { icon: 'wifi', label: 'Internet' },
      { icon: 'phone_android', label: 'Phone' },
      { icon: 'local_fire_department', label: 'Gas' },
      { icon: 'tv', label: 'Subscriptions' },
    ],

    'Health': [
      { icon: 'favorite', label: 'Health' },
      { icon: 'fitness_center', label: 'Gym' },
      { icon: 'medical_services', label: 'Doctor' },
      { icon: 'medication', label: 'Pharmacy' },
      { icon: 'spa', label: 'Wellness' },
    ],

    'Entertainment': [
      { icon: 'movie', label: 'Movies' },
      { icon: 'music_note', label: 'Music' },
      { icon: 'sports_esports', label: 'Games' },
      { icon: 'photo_camera', label: 'Photo' },
      { icon: 'menu_book', label: 'Books' },
      { icon: 'sports_soccer', label: 'Sports' },
    ],

    'Finance': [
      { icon: 'credit_card', label: 'Card' },
      { icon: 'savings', label: 'Savings' },
      { icon: 'account_balance', label: 'Bank' },
      { icon: 'trending_up', label: 'Investment' },
      { icon: 'payments', label: 'Payments' },
      { icon: 'receipt_long', label: 'Bills' },
    ],

    'Other': [
      { icon: 'work', label: 'Work' },
      { icon: 'school', label: 'Education' },
      { icon: 'build', label: 'Repairs' },
      { icon: 'pets', label: 'Pets' },
      { icon: 'child_care', label: 'Kids' },
      { icon: 'category', label: 'General' },
      { icon: 'volunteer_activism', label: 'Charity' },
    ],
  };

  getAllIconsByCategory(): Record<string, IconOption[]> {
    const result: Record<string, IconOption[]> = {};
    for (const [category, icons] of Object.entries(this.iconCategories)) {
      result[category] = icons.map(item => ({ ...item, category }));
    }
    return result;
  }

  getAllIcons(): IconOption[] {
    return Object.entries(this.iconCategories).flatMap(([category, icons]) =>
      icons.map(item => ({ ...item, category }))
    );
  }

  getPopularIcons(): IconOption[] {
    return [
      { icon: 'restaurant', label: 'Food', category: 'Food & Drinks' },
      { icon: 'directions_car', label: 'Transport', category: 'Transport' },
      { icon: 'shopping_cart', label: 'Shopping', category: 'Shopping' },
      { icon: 'home', label: 'Housing', category: 'Bills' },
      { icon: 'favorite', label: 'Health', category: 'Health' },
      { icon: 'movie', label: 'Entertainment', category: 'Entertainment' },
      { icon: 'credit_card', label: 'Finance', category: 'Finance' },
      { icon: 'work', label: 'Work', category: 'Other' },
      { icon: 'school', label: 'Education', category: 'Other' },
      { icon: 'local_grocery_store', label: 'Groceries', category: 'Food & Drinks' },
    ];
  }

  searchIcons(query: string): IconOption[] {
    if (!query.trim()) return this.getAllIcons();
    const term = query.toLowerCase();
    return this.getAllIcons().filter(icon =>
      icon.label.toLowerCase().includes(term) ||
      icon.icon.toLowerCase().includes(term) ||
      icon.category.toLowerCase().includes(term)
    );
  }

  getCategories(): string[] {
    return Object.keys(this.iconCategories);
  }
}
