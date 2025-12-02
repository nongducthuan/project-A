import { Chart } from "react-google-charts";

export default function Report() {
  const weeklyOrders = 85;
  const monthlyOrders = 320;
  const weeklyRevenue = 145000000; 
  const monthlyRevenue = 630000000;
  const productsSoldWeek = 210;
  const productsSoldMonth = 890;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const comboChartWeekData = [
    ["Day", "Products Sold", "Orders"],
    ["Mon", 32, 12],
    ["Tue", 28, 10],
    ["Wed", 35, 14],
    ["Thu", 25, 9],
    ["Fri", 40, 15],
    ["Sat", 30, 12],
    ["Sun", 20, 8],
  ];

  const comboChartWeekOptions = {
    title: "This Week's Statistics",
    vAxis: { title: "Quantity" },
    hAxis: { title: "Day of the Week" },
    seriesType: "bars",
    legend: { position: "bottom" },
    chartArea: { width: "80%", height: "70%" },
  };

  const lineChartWeekData = [
    ["Day", "Revenue"],
    ["Mon", 25000000],
    ["Tue", 21000000],
    ["Wed", 30000000],
    ["Thu", 18000000],
    ["Fri", 35000000],
    ["Sat", 23000000],
    ["Sun", 13000000],
  ];

  const lineChartWeekOptions = {
    title: "Weekly Revenue (VND)",
    hAxis: { title: "Day" },
    vAxis: { 
        title: "Revenue",
        format: 'short'
    },
    legend: { position: "bottom" },
    curveType: "function",
    chartArea: { width: "80%", height: "70%" },
  };

  const pieChartWeekData = [
    ["Status", "Quantity"],
    ["Pending", 15],
    ["Confirmed", 20],
    ["Shipping", 18],
    ["Delivered", 25],
    ["Cancelled", 7],
  ];

  const pieChartWeekOptions = {
    title: "Weekly Order Ratio",
    pieHole: 0.4,
    chartArea: { width: "80%", height: "70%" },
    colors: ["#ffc107", "#17a2b8", "#007bff", "#28a745", "#dc3545"],
  };

  const comboChartMonthData = [
    ["Month", "Products Sold", "Orders"],
    ["Jan", 70, 25],
    ["Feb", 75, 28],
    ["Mar", 80, 30],
    ["Apr", 72, 26],
    ["May", 85, 32],
    ["Jun", 90, 35],
    ["Jul", 78, 28],
    ["Aug", 82, 30],
    ["Sep", 88, 33],
    ["Oct", 92, 35],
    ["Nov", 95, 36],
    ["Dec", 100, 40],
  ];

  const comboChartMonthOptions = {
    title: "Monthly Statistics (Yearly View)",
    vAxis: { title: "Quantity" },
    hAxis: { title: "Month" },
    seriesType: "bars",
    legend: { position: "bottom" },
    chartArea: { width: "80%", height: "70%" },
  };

  const lineChartMonthData = [
    ["Month", "Revenue"],
    ["Jan", 45000000],
    ["Feb", 48000000],
    ["Mar", 52000000],
    ["Apr", 50000000],
    ["May", 55000000],
    ["Jun", 58000000],
    ["Jul", 53000000],
    ["Aug", 52000000],
    ["Sep", 56000000],
    ["Oct", 60000000],
    ["Nov", 62000000],
    ["Dec", 65000000],
  ];

  const lineChartMonthOptions = {
    title: "Monthly Revenue (VND)",
    hAxis: { title: "Month" },
    vAxis: { 
        title: "Revenue",
        format: 'short'
    },
    legend: { position: "bottom" },
    curveType: "function",
    chartArea: { width: "80%", height: "70%" },
  };

  const pieChartMonthData = [
    ["Status", "Quantity"],
    ["Pending", 40],
    ["Confirmed", 70],
    ["Shipping", 65],
    ["Delivered", 120],
    ["Cancelled", 25],
  ];

  const pieChartMonthOptions = {
    title: "Monthly Order Ratio",
    pieHole: 0.4,
    chartArea: { width: "80%", height: "70%" },
    colors: ["#ffc107", "#17a2b8", "#007bff", "#28a745", "#dc3545"],
  };

  return (
    <div className="container mx-auto mt-6 px-2 md:px-4">
      <h2 className="text-center text-2xl font-bold mb-6">Statistical Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 shadow rounded bg-blue-50 text-center">
          <h4 className="font-semibold text-lg">Weekly Orders</h4>
          <p className="text-2xl font-bold">{weeklyOrders}</p>
        </div>
        <div className="p-4 shadow rounded bg-green-50 text-center">
          <h4 className="font-semibold text-lg">Monthly Orders</h4>
          <p className="text-2xl font-bold">{monthlyOrders}</p>
        </div>
        <div className="p-4 shadow rounded bg-yellow-50 text-center">
          <h4 className="font-semibold text-lg">Weekly Revenue</h4>
          <p className="text-2xl font-bold">{formatCurrency(weeklyRevenue)}</p>
        </div>
        <div className="p-4 shadow rounded bg-purple-50 text-center">
          <h4 className="font-semibold text-lg">Monthly Revenue</h4>
          <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
        </div>
        <div className="p-4 shadow rounded bg-pink-50 text-center">
          <h4 className="font-semibold text-lg">Products Sold (Week)</h4>
          <p className="text-2xl font-bold">{productsSoldWeek}</p>
        </div>
        <div className="p-4 shadow rounded bg-indigo-50 text-center">
          <h4 className="font-semibold text-lg">Products Sold (Month)</h4>
          <p className="text-2xl font-bold">{productsSoldMonth}</p>
        </div>
      </div>

      <h3 className="text-center text-xl font-bold mb-2">Weekly Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="w-full h-64 md:h-72">
          <Chart
            chartType="ComboChart"
            width="100%"
            height="100%"
            data={comboChartWeekData}
            options={comboChartWeekOptions}
          />
        </div>
        <div className="w-full h-64 md:h-72">
          <Chart
            chartType="LineChart"
            width="100%"
            height="100%"
            data={lineChartWeekData}
            options={lineChartWeekOptions}
          />
        </div>
        <div className="w-full h-64 md:h-72">
          <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={pieChartWeekData}
            options={pieChartWeekOptions}
          />
        </div>
      </div>

      <h3 className="text-center text-xl font-bold mb-2">Monthly Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="w-full h-64 md:h-72">
          <Chart
            chartType="ComboChart"
            width="100%"
            height="100%"
            data={comboChartMonthData}
            options={comboChartMonthOptions}
          />
        </div>
        <div className="w-full h-64 md:h-72">
          <Chart
            chartType="LineChart"
            width="100%"
            height="100%"
            data={lineChartMonthData}
            options={lineChartMonthOptions}
          />
        </div>
        <div className="w-full h-64 md:h-72">
          <Chart
            chartType="PieChart"
            width="100%"
            height="100%"
            data={pieChartMonthData}
            options={pieChartMonthOptions}
          />
        </div>
      </div>
    </div>
  );
}