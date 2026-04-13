export const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomChance = (percent) =>
  Math.random() < percent / 100;

const createTimeLabel = (timestamp = Date.now()) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const appendPoint = (series, point, maxPoints) => {
  const nextSeries = [...series, point];
  return nextSeries.slice(-maxPoints);
};

export const GLOBAL_LIVE_CONFIG = {
  label: 'Global',
  initial: {
    sales: 24580,
    revenue: 7412000,
    orders: 6120,
    inventory: 18250,
  },
  salesIncrement: [100, 500],
  orderIncrement: [3, 12],
  avgPrice: [280, 420],
  inventoryDrop: [1, 5],
  inventoryPerSalesChunk: 120,
  restockChance: 10,
  restockAmount: [20, 50],
  inventoryFloor: 900,
  maxPoints: 12,
};

export const BRANCH_LIVE_CONFIG = {
  label: 'Branch',
  initial: {
    sales: 3280,
    revenue: 892000,
    orders: 910,
    inventory: 2480,
  },
  salesIncrement: [12, 60],
  orderIncrement: [1, 4],
  avgPrice: [220, 360],
  inventoryDrop: [1, 3],
  inventoryPerSalesChunk: 45,
  restockChance: 10,
  restockAmount: [8, 24],
  inventoryFloor: 140,
  maxPoints: 12,
};

export const createInitialLiveState = (config, timestamp = Date.now()) => {
  const { sales, revenue, orders, inventory } = config.initial;

  return {
    sales,
    revenue,
    orders,
    inventory,
    salesDelta: 0,
    revenueDelta: 0,
    orderDelta: 0,
    inventoryDelta: 0,
    restocked: 0,
    lastUpdatedAt: timestamp,
    series: [
      {
        time: createTimeLabel(timestamp),
        sales,
        revenue,
        orders,
        inventory,
      },
    ],
  };
};

export const simulateNextLiveState = (prevState, config, timestamp = Date.now()) => {
  const salesDelta = randomBetween(config.salesIncrement[0], config.salesIncrement[1]);
  const orderDelta = randomBetween(config.orderIncrement[0], config.orderIncrement[1]);

  const averagePrice = randomBetween(config.avgPrice[0], config.avgPrice[1]);
  const revenueDelta = salesDelta * averagePrice;

  const salesDrivenDrop = Math.max(1, Math.floor(salesDelta / config.inventoryPerSalesChunk));
  const baselineDrop = randomBetween(config.inventoryDrop[0], config.inventoryDrop[1]);
  const inventoryDrop = baselineDrop + salesDrivenDrop;

  const shouldRestock =
    prevState.inventory - inventoryDrop <= config.inventoryFloor ||
    randomChance(config.restockChance);

  const restocked = shouldRestock
    ? randomBetween(config.restockAmount[0], config.restockAmount[1])
    : 0;

  const nextInventory = Math.max(
    config.inventoryFloor,
    prevState.inventory - inventoryDrop + restocked
  );

  const nextState = {
    sales: prevState.sales + salesDelta,
    revenue: prevState.revenue + revenueDelta,
    orders: prevState.orders + orderDelta,
    inventory: nextInventory,
    salesDelta,
    revenueDelta,
    orderDelta,
    inventoryDelta: restocked - inventoryDrop,
    restocked,
    lastUpdatedAt: timestamp,
  };

  const nextPoint = {
    time: createTimeLabel(timestamp),
    sales: nextState.sales,
    revenue: nextState.revenue,
    orders: nextState.orders,
    inventory: nextState.inventory,
  };

  return {
    ...nextState,
    series: appendPoint(prevState.series, nextPoint, config.maxPoints),
  };
};
