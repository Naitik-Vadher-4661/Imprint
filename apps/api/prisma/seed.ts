import { PrismaClient } from '@prisma/client';
import { ActivityCategoryType, GoalType, BadgeCategory, MeasurementUnit } from '../src/types/enums';

const prisma = new PrismaClient();

const categories = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    type: ActivityCategoryType.TRANSPORT,
    name: "Transport",
    slug: "transport",
    icon: "🚗",
    description: "Emissions from travel and commuting",
    sortOrder: 1,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    type: ActivityCategoryType.FOOD,
    name: "Food",
    slug: "food",
    icon: "🍽️",
    description: "Emissions from food consumption and waste",
    sortOrder: 2,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    type: ActivityCategoryType.ENERGY,
    name: "Energy",
    slug: "energy",
    icon: "⚡",
    description: "Emissions from household energy usage",
    sortOrder: 3,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    type: ActivityCategoryType.WASTE,
    name: "Waste",
    slug: "waste",
    icon: "🗑️",
    description: "Emissions from waste disposal and management",
    sortOrder: 4,
  },
];

// static fallback values
const emissionFactorsInput = [
  // ─── Transport ───
  { categorySlug: "transport", subcategory: "car_petrol",       displayName: "Car (Petrol)",        unit: MeasurementUnit.KM,    factorKgCo2e: 0.174, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "car_diesel",       displayName: "Car (Diesel)",        unit: MeasurementUnit.KM,    factorKgCo2e: 0.168, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "car_electric",     displayName: "Car (Electric)",      unit: MeasurementUnit.KM,    factorKgCo2e: 0.053, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "motorcycle",       displayName: "Motorcycle",          unit: MeasurementUnit.KM,    factorKgCo2e: 0.114, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "bus",              displayName: "Bus",                 unit: MeasurementUnit.KM,    factorKgCo2e: 0.089, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "train",            displayName: "Train",               unit: MeasurementUnit.KM,    factorKgCo2e: 0.041, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "metro",            displayName: "Metro / Subway",      unit: MeasurementUnit.KM,    factorKgCo2e: 0.033, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "flight_short",     displayName: "Flight (Short-haul)", unit: MeasurementUnit.KM,    factorKgCo2e: 0.255, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "flight_long",      displayName: "Flight (Long-haul)",  unit: MeasurementUnit.KM,    factorKgCo2e: 0.195, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "transport", subcategory: "bicycle",          displayName: "Bicycle",             unit: MeasurementUnit.KM,    factorKgCo2e: 0.000, source: "Zero emission" },
  { categorySlug: "transport", subcategory: "walking",          displayName: "Walking",             unit: MeasurementUnit.KM,    factorKgCo2e: 0.000, source: "Zero emission" },

  // ─── Food ───
  { categorySlug: "food", subcategory: "beef",             displayName: "Beef",                unit: MeasurementUnit.KG,    factorKgCo2e: 27.0,  source: "static_fallback (Poore & Nemecek 2018)" },
  { categorySlug: "food", subcategory: "chicken",          displayName: "Chicken",             unit: MeasurementUnit.KG,    factorKgCo2e: 6.9,   source: "static_fallback (Poore & Nemecek 2018)" },
  { categorySlug: "food", subcategory: "pork",             displayName: "Pork",                unit: MeasurementUnit.KG,    factorKgCo2e: 12.1,  source: "static_fallback (Poore & Nemecek 2018)" },
  { categorySlug: "food", subcategory: "fish",             displayName: "Fish",                unit: MeasurementUnit.KG,    factorKgCo2e: 6.1,   source: "static_fallback (Poore & Nemecek 2018)" },
  { categorySlug: "food", subcategory: "dairy",            displayName: "Dairy Products",      unit: MeasurementUnit.KG,    factorKgCo2e: 3.2,   source: "static_fallback (Poore & Nemecek 2018)" },
  { categorySlug: "food", subcategory: "vegetarian_meal",  displayName: "Vegetarian Meal",     unit: MeasurementUnit.MEAL,  factorKgCo2e: 0.5,   source: "static_fallback (OWID estimate)" },
  { categorySlug: "food", subcategory: "vegan_meal",       displayName: "Vegan Meal",          unit: MeasurementUnit.MEAL,  factorKgCo2e: 0.3,   source: "static_fallback (OWID estimate)" },
  { categorySlug: "food", subcategory: "meat_meal",        displayName: "Meat-based Meal",     unit: MeasurementUnit.MEAL,  factorKgCo2e: 1.7,   source: "static_fallback (OWID estimate)" },
  { categorySlug: "food", subcategory: "food_waste",       displayName: "Food Waste",          unit: MeasurementUnit.KG,    factorKgCo2e: 2.5,   source: "static_fallback (EPA WARM 2024)" },

  // ─── Energy ───
  { categorySlug: "energy", subcategory: "electricity",      displayName: "Electricity",         unit: MeasurementUnit.KWH,   factorKgCo2e: 0.417, source: "static_fallback (EIA 2024)" },
  { categorySlug: "energy", subcategory: "natural_gas",      displayName: "Natural Gas",         unit: MeasurementUnit.KWH,   factorKgCo2e: 0.185, source: "static_fallback (EIA 2024)" },
  { categorySlug: "energy", subcategory: "lpg",              displayName: "LPG",                 unit: MeasurementUnit.KG,    factorKgCo2e: 2.983, source: "static_fallback (DEFRA 2024)" },
  { categorySlug: "energy", subcategory: "air_conditioning", displayName: "Air Conditioning",    unit: MeasurementUnit.HOURS, factorKgCo2e: 0.285, source: "Estimated (1.5kW × grid)" },
  { categorySlug: "energy", subcategory: "heating",          displayName: "Heating",             unit: MeasurementUnit.HOURS, factorKgCo2e: 0.350, source: "Estimated (2kW × grid)" },
  { categorySlug: "energy", subcategory: "washing_machine",  displayName: "Washing Machine",     unit: MeasurementUnit.COUNT, factorKgCo2e: 0.600, source: "Estimated (1.2kWh/cycle)" },
  { categorySlug: "energy", subcategory: "dishwasher",       displayName: "Dishwasher",          unit: MeasurementUnit.COUNT, factorKgCo2e: 0.500, source: "Estimated (1.0kWh/cycle)" },

  // ─── Waste ───
  { categorySlug: "waste", subcategory: "general_waste",    displayName: "General Waste",       unit: MeasurementUnit.KG,    factorKgCo2e: 0.690, source: "static_fallback (EPA WARM 2024)" },
  { categorySlug: "waste", subcategory: "recycling",        displayName: "Recycling",           unit: MeasurementUnit.KG,    factorKgCo2e: -0.210, source: "static_fallback (EPA WARM 2024)" },
  { categorySlug: "waste", subcategory: "composting",       displayName: "Composting",          unit: MeasurementUnit.KG,    factorKgCo2e: -0.100, source: "static_fallback (EPA WARM 2024)" },
  { categorySlug: "waste", subcategory: "plastic",          displayName: "Plastic Waste",       unit: MeasurementUnit.KG,    factorKgCo2e: 1.100, source: "static_fallback (EPA WARM 2024)" },
  { categorySlug: "waste", subcategory: "paper",            displayName: "Paper Waste",         unit: MeasurementUnit.KG,    factorKgCo2e: 0.460, source: "static_fallback (EPA WARM 2024)" },
  { categorySlug: "waste", subcategory: "e_waste",          displayName: "Electronic Waste",    unit: MeasurementUnit.KG,    factorKgCo2e: 2.000, source: "static_fallback (EPA estimate)" },
];

const badges = [
  // ─── Logging ───
  { slug: "first_step",    name: "First Step",       icon: "🌱", category: BadgeCategory.LOGGING,    threshold: 1,   points: 10,   description: "Log your first activity" },
  { slug: "logger",        name: "Logger",           icon: "📝", category: BadgeCategory.LOGGING,    threshold: 10,  points: 25,   description: "Log 10 activities" },
  { slug: "data_driven",   name: "Data Driven",      icon: "📊", category: BadgeCategory.LOGGING,    threshold: 100, points: 100,  description: "Log 100 activities" },

  // ─── Streaks ───
  { slug: "week_warrior",  name: "Week Warrior",     icon: "🔥", category: BadgeCategory.STREAK,     threshold: 7,   points: 50,   description: "Maintain a 7-day streak" },
  { slug: "monthly_champ", name: "Monthly Champion", icon: "🔥", category: BadgeCategory.STREAK,     threshold: 30,  points: 200,  description: "Maintain a 30-day streak" },
  { slug: "quarter_master",name: "Quarter Master",   icon: "🔥", category: BadgeCategory.STREAK,     threshold: 90,  points: 500,  description: "Maintain a 90-day streak" },
  { slug: "year_of_impact",name: "Year of Impact",   icon: "🔥", category: BadgeCategory.STREAK,     threshold: 365, points: 2000, description: "Maintain a 365-day streak" },

  // ─── Goals ───
  { slug: "goal_setter",   name: "Goal Setter",      icon: "🎯", category: BadgeCategory.GOAL,       threshold: 1,   points: 15,   description: "Create your first goal" },
  { slug: "achiever",      name: "Achiever",         icon: "✅", category: BadgeCategory.GOAL,       threshold: 1,   points: 50,   description: "Complete your first goal" },
  { slug: "hat_trick",     name: "Hat Trick",        icon: "🏆", category: BadgeCategory.GOAL,       threshold: 3,   points: 150,  description: "Complete 3 goals" },

  // ─── Reduction ───
  { slug: "eco_starter",   name: "Eco Starter",      icon: "🌿", category: BadgeCategory.REDUCTION,  threshold: 5,   points: 75,   description: "Reduce emissions by 5%" },
  { slug: "carbon_cutter", name: "Carbon Cutter",    icon: "🌳", category: BadgeCategory.REDUCTION,  threshold: 10,  points: 200,  description: "Reduce total emissions by 10%" },

  // ─── Category ───
  { slug: "green_commuter",name: "Green Commuter",   icon: "🚴", category: BadgeCategory.CATEGORY,   threshold: 20,  points: 100,  description: "Log 20+ zero-emission transport activities" },
  { slug: "plant_powered", name: "Plant Powered",    icon: "🥗", category: BadgeCategory.CATEGORY,   threshold: 30,  points: 100,  description: "Log 30+ vegetarian/vegan meals" },
  { slug: "waste_warrior", name: "Waste Warrior",    icon: "♻️", category: BadgeCategory.CATEGORY,   threshold: 15,  points: 75,   description: "Log 15+ recycling/composting activities" },

  // ─── Engagement ───
  { slug: "insight_seeker",name: "Insight Seeker",   icon: "💡", category: BadgeCategory.ENGAGEMENT, threshold: 10,  points: 30,   description: "View AI insights 10 times" },
  { slug: "sharer",        name: "Sharer",           icon: "📤", category: BadgeCategory.ENGAGEMENT, threshold: 1,   points: 20,   description: "Export your first report" },
  
  // ─── Tasks / Gamification ───
  { slug: "task_novice",   name: "Task Novice",      icon: "🎯", category: BadgeCategory.GOAL,       threshold: 5,   points: 50,   description: "Complete 5 tasks" },
  { slug: "task_pro",      name: "Task Pro",         icon: "🏅", category: BadgeCategory.GOAL,       threshold: 15,  points: 150,  description: "Complete 15 tasks" },
  { slug: "task_master",   name: "Task Master",      icon: "👑", category: BadgeCategory.GOAL,       threshold: 50,  points: 500,  description: "Complete 50 tasks" },
];

const goalPresets = [
  // ─── Transport Tasks (10) ───
  { name: "Walk to Work", description: "Walk to work instead of driving for 1 day.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 1, difficulty: "easy", icon: "🚶" },
  { name: "Cycle Commute", description: "Cycle to work or school twice this week.", type: GoalType.ACTIVITY_COUNT, targetValue: 2, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 7, difficulty: "easy", icon: "🚴" },
  { name: "Public Transit Hero", description: "Take the bus or train 5 times.", type: GoalType.ACTIVITY_COUNT, targetValue: 5, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 14, difficulty: "medium", icon: "🚌" },
  { name: "Carpool Week", description: "Carpool with colleagues or friends 3 times.", type: GoalType.ACTIVITY_COUNT, targetValue: 3, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 7, difficulty: "medium", icon: "🚗" },
  { name: "No-Drive Weekend", description: "Don't use a personal car for the entire weekend.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 2, difficulty: "medium", icon: "🛑" },
  { name: "EV Test Drive", description: "Test drive an electric vehicle or ride in an EV taxi.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 30, difficulty: "easy", icon: "⚡" },
  { name: "Transport Carbon Cut", description: "Reduce transport emissions by 20% this month.", type: GoalType.REDUCTION_PERCENTAGE, targetValue: 20, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 30, difficulty: "hard", icon: "📉" },
  { name: "Flight-Free Month", description: "Commit to taking zero flights for 30 days.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 30, difficulty: "hard", icon: "✈️" },
  { name: "Walk 10km", description: "Replace 10km of driving with walking this week.", type: GoalType.ACTIVITY_COUNT, targetValue: 10, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 7, difficulty: "hard", icon: "👟" },
  { name: "Micro-Mobility", description: "Use an e-scooter or e-bike for a short trip.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.TRANSPORT, durationDays: 7, difficulty: "easy", icon: "🛴" },

  // ─── Food Tasks (15) ───
  { name: "Meatless Monday", description: "Eat only vegetarian meals for one full day.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 1, difficulty: "easy", icon: "🥗" },
  { name: "Vegan for a Day", description: "Eat only vegan meals for one full day.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 1, difficulty: "medium", icon: "🌱" },
  { name: "Zero Food Waste Week", description: "Generate zero food waste for 7 days.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "hard", icon: "🚫" },
  { name: "Local Produce", description: "Buy vegetables from a local farmer's market.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "easy", icon: "🥕" },
  { name: "Plant-Based Milk", description: "Switch to plant-based milk for a week.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "easy", icon: "🥛" },
  { name: "Batch Cooking", description: "Cook meals in bulk to save energy and reduce waste.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "medium", icon: "🍳" },
  { name: "Compost Starter", description: "Start a compost bin or use a local compost service.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 14, difficulty: "hard", icon: "🪱" },
  { name: "No Beef Week", description: "Avoid eating beef for 7 consecutive days.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "medium", icon: "🐄" },
  { name: "Seasonal Eating", description: "Cook a meal using only seasonal ingredients.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "easy", icon: "🍅" },
  { name: "Grow Your Own", description: "Plant herbs or a vegetable at home.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 30, difficulty: "medium", icon: "🌿" },
  { name: "Ugly Veggies", description: "Buy 'imperfect' or wonky vegetables.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "easy", icon: "🥔" },
  { name: "Reusable Coffee Cup", description: "Use a reusable cup for takeout coffee 5 times.", type: GoalType.ACTIVITY_COUNT, targetValue: 5, categoryType: ActivityCategoryType.FOOD, durationDays: 14, difficulty: "medium", icon: "☕" },
  { name: "Meatless Week", description: "Eat vegetarian for 7 straight days.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 7, difficulty: "hard", icon: "🥑" },
  { name: "Food Footprint Cut", description: "Reduce your food emissions by 15% this month.", type: GoalType.REDUCTION_PERCENTAGE, targetValue: 15, categoryType: ActivityCategoryType.FOOD, durationDays: 30, difficulty: "hard", icon: "📉" },
  { name: "Forage or Glean", description: "Pick wild berries or participate in a gleaning event.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.FOOD, durationDays: 30, difficulty: "medium", icon: "🍓" },

  // ─── Energy Tasks (10) ───
  { name: "Lights Out", description: "Turn off lights in empty rooms for 3 days.", type: GoalType.ACTIVITY_COUNT, targetValue: 3, categoryType: ActivityCategoryType.ENERGY, durationDays: 3, difficulty: "easy", icon: "💡" },
  { name: "Cold Wash", description: "Wash a load of laundry in cold water.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.ENERGY, durationDays: 7, difficulty: "easy", icon: "🧺" },
  { name: "Line Dry", description: "Air dry your clothes instead of using a dryer.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.ENERGY, durationDays: 7, difficulty: "easy", icon: "👕" },
  { name: "Unplug Devices", description: "Unplug vampire appliances (TVs, chargers) overnight.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.ENERGY, durationDays: 1, difficulty: "easy", icon: "🔌" },
  { name: "LED Upgrade", description: "Replace 3 incandescent bulbs with LEDs.", type: GoalType.ACTIVITY_COUNT, targetValue: 3, categoryType: ActivityCategoryType.ENERGY, durationDays: 30, difficulty: "medium", icon: "🔆" },
  { name: "Thermostat Tweaker", description: "Lower heating by 1°C or raise AC by 1°C for a week.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.ENERGY, durationDays: 7, difficulty: "medium", icon: "🌡️" },
  { name: "Energy Audit", description: "Perform a basic home energy audit.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.ENERGY, durationDays: 30, difficulty: "hard", icon: "📋" },
  { name: "Green Energy Switch", description: "Opt into a renewable energy plan with your provider.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.ENERGY, durationDays: 60, difficulty: "hard", icon: "⚡" },
  { name: "Shorter Showers", description: "Take a 5-minute shower for 5 consecutive days.", type: GoalType.ACTIVITY_COUNT, targetValue: 5, categoryType: ActivityCategoryType.ENERGY, durationDays: 7, difficulty: "medium", icon: "🚿" },
  { name: "Energy Footprint Cut", description: "Reduce overall home energy use by 10%.", type: GoalType.REDUCTION_PERCENTAGE, targetValue: 10, categoryType: ActivityCategoryType.ENERGY, durationDays: 30, difficulty: "hard", icon: "📉" },

  // ─── Waste & Shopping Tasks (10) ───
  { name: "Zero Waste Shopping", description: "Buy groceries without any single-use plastic.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 7, difficulty: "medium", icon: "🛍️" },
  { name: "Recycling Pro", description: "Sort all recycling perfectly for a week.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 7, difficulty: "easy", icon: "♻️" },
  { name: "Second-Hand Clothes", description: "Buy a clothing item second-hand instead of new.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 30, difficulty: "medium", icon: "👕" },
  { name: "Repair Instead of Replace", description: "Mend or repair a broken item.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 30, difficulty: "medium", icon: "🪡" },
  { name: "Digital Clean Up", description: "Delete 1GB of old emails or cloud files.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 7, difficulty: "easy", icon: "💻" },
  { name: "No Plastic Bags", description: "Bring your own bags for shopping 5 times.", type: GoalType.ACTIVITY_COUNT, targetValue: 5, categoryType: ActivityCategoryType.WASTE, durationDays: 30, difficulty: "easy", icon: "👜" },
  { name: "Ditch Paper Towels", description: "Use cloth rags instead of paper towels for 7 days.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 7, difficulty: "medium", icon: "🧻" },
  { name: "Upcycle Project", description: "Upcycle an old item into something useful.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 30, difficulty: "hard", icon: "🎨" },
  { name: "Refill Station", description: "Use a refill station for soap or detergent.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: ActivityCategoryType.WASTE, durationDays: 30, difficulty: "medium", icon: "🧴" },
  { name: "Waste Reduction Goal", description: "Reduce your weekly waste output by 20%.", type: GoalType.REDUCTION_PERCENTAGE, targetValue: 20, categoryType: ActivityCategoryType.WASTE, durationDays: 30, difficulty: "hard", icon: "📉" },

  // ─── General & Habit Tasks (5) ───
  { name: "Daily Logger", description: "Log an activity every day for 7 days.", type: GoalType.STREAK, targetValue: 7, categoryType: null, durationDays: 7, difficulty: "medium", icon: "📅" },
  { name: "Carbon Educated", description: "Read an article about climate change.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: null, durationDays: 1, difficulty: "easy", icon: "📖" },
  { name: "Community Action", description: "Participate in a local clean-up or climate event.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: null, durationDays: 30, difficulty: "hard", icon: "🤝" },
  { name: "Footprint Check", description: "Review your AI insights 3 times.", type: GoalType.ACTIVITY_COUNT, targetValue: 3, categoryType: null, durationDays: 14, difficulty: "easy", icon: "🔍" },
  { name: "Carbon Neutral Day", description: "Offset a full day of your carbon footprint.", type: GoalType.ACTIVITY_COUNT, targetValue: 1, categoryType: null, durationDays: 7, difficulty: "hard", icon: "⚖️" },
];

async function main() {
  console.log('Seeding data...');

  // 1. Categories
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    const created = await prisma.activityCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // 2. Emission Factors
  let efCount = 0;
  for (const ef of emissionFactorsInput) {
    const categoryId = categoryMap.get(ef.categorySlug);
    if (!categoryId) continue;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categorySlug: _categorySlug, ...efData } = ef;
    await prisma.emissionFactor.upsert({
      where: {
        categoryId_subcategory_region: {
          categoryId,
          subcategory: efData.subcategory,
          region: 'global',
        },
      },
      update: { ...efData, categoryId },
      create: { ...efData, categoryId },
    });
    efCount++;
  }
  console.log(`✅ Seeded ${efCount} emission factors`);

  // 3. Badges
  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }
  console.log(`✅ Seeded ${badges.length} badges`);

  // 4. Goal Presets
  for (const preset of goalPresets) {
    // Unique name constraint isn't on the schema, but we can just use deleteMany and create
    // Actually we can just wipe them first if we want, or just create them if they don't exist
    const existing = await prisma.goalPreset.findFirst({ where: { name: preset.name } });
    if (!existing) {
      await prisma.goalPreset.create({
        data: preset,
      });
    }
  }
  console.log(`✅ Seeded ${goalPresets.length} goal presets`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
