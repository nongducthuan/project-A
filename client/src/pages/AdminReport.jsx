import { Chart } from "react-google-charts";

export default function AdminReport() {
  // ======= Dữ liệu giả =======
  const weeklyOrders = 12;
  const monthlyOrders = 48;
  const weeklyRevenue = 35000000; // chục triệu
  const monthlyRevenue = 120000000;
  const productsSoldWeek = 35;
  const productsSoldMonth = 120;

  // ======= Dữ liệu biểu đồ tuần =======
  const comboChartWeekData = [
    ["Ngày", "Sản phẩm bán", "Đơn hàng"],
    ["Thứ 2", 5, 2],
    ["Thứ 3", 6, 3],
    ["Thứ 4", 7, 4],
    ["Thứ 5", 4, 2],
    ["Thứ 6", 8, 5],
    ["Thứ 7", 5, 3],
    ["CN", 6, 4],
  ];
  const comboChartWeekOptions = {
    title: "Thống kê tuần này",
    vAxis: { title: "Số lượng" },
    hAxis: { title: "Ngày trong tuần" },
    seriesType: "bars",
    legend: { position: "bottom" },
    chartArea: { width: "80%", height: "70%" }, // chart gọn hơn
  };

  const lineChartWeekData = [
    ["Ngày", "Doanh thu"],
    ["Thứ 2", 5000000],
    ["Thứ 3", 4000000],
    ["Thứ 4", 6000000],
    ["Thứ 5", 3000000],
    ["Thứ 6", 7000000],
    ["Thứ 7", 5500000],
    ["CN", 4500000],
  ];
  const lineChartWeekOptions = {
    title: "Doanh thu tuần (VNĐ)",
    hAxis: { title: "Ngày" },
    vAxis: { title: "Doanh thu" },
    legend: { position: "bottom" },
    curveType: "function",
    chartArea: { width: "80%", height: "70%" },
  };

  const pieChartWeekData = [
    ["Trạng thái", "Số lượng"],
    ["Đã giao", 30],
    ["Đang xử lý", 10],
    ["Hủy", 8],
  ];
  const pieChartWeekOptions = {
    title: "Tỷ lệ đơn hàng tuần",
    pieHole: 0.4,
    chartArea: { width: "80%", height: "70%" },
  };

  // ======= Dữ liệu biểu đồ tháng =======
  const comboChartMonthData = [
    ["Tháng", "Sản phẩm bán", "Đơn hàng"],
    ["1", 40, 20],
    ["2", 45, 25],
    ["3", 50, 30],
    ["4", 38, 28],
    ["5", 55, 35],
    ["6", 60, 40],
    ["7", 52, 30],
    ["8", 48, 32],
    ["9", 50, 35],
    ["10", 58, 38],
    ["11", 62, 40],
    ["12", 70, 45],
  ];
  const comboChartMonthOptions = {
    title: "Thống kê tháng",
    vAxis: { title: "Số lượng" },
    hAxis: { title: "Tháng" },
    seriesType: "bars",
    legend: { position: "bottom" },
    chartArea: { width: "80%", height: "70%" },
  };

  const lineChartMonthData = [
    ["Tháng", "Doanh thu"],
    ["1", 10000000],
    ["2", 12000000],
    ["3", 15000000],
    ["4", 13000000],
    ["5", 17000000],
    ["6", 18000000],
    ["7", 16000000],
    ["8", 15500000],
    ["9", 17000000],
    ["10", 18000000],
    ["11", 19000000],
    ["12", 21000000],
  ];
  const lineChartMonthOptions = {
    title: "Doanh thu tháng (VNĐ)",
    hAxis: { title: "Tháng" },
    vAxis: { title: "Doanh thu" },
    legend: { position: "bottom" },
    curveType: "function",
    chartArea: { width: "80%", height: "70%" },
  };

  const pieChartMonthData = [
    ["Trạng thái", "Số lượng"],
    ["Đã giao", 200],
    ["Đang xử lý", 50],
    ["Hủy", 20],
  ];
  const pieChartMonthOptions = {
    title: "Tỷ lệ đơn hàng tháng",
    pieHole: 0.4,
    chartArea: { width: "80%", height: "70%" },
  };

  return (
    <div className="container mx-auto mt-6 px-2 md:px-4">
      <h2 className="text-center text-2xl font-bold mb-6">Báo Cáo Thống Kê</h2>

      {/* ======= Tổng quan nhanh ======= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 shadow rounded bg-blue-50 text-center">
          <h4 className="font-semibold text-lg">Đơn hàng tuần</h4>
          <p className="text-2xl font-bold">{weeklyOrders}</p>
        </div>
        <div className="p-4 shadow rounded bg-green-50 text-center">
          <h4 className="font-semibold text-lg">Đơn hàng tháng</h4>
          <p className="text-2xl font-bold">{monthlyOrders}</p>
        </div>
        <div className="p-4 shadow rounded bg-yellow-50 text-center">
          <h4 className="font-semibold text-lg">Doanh thu tuần</h4>
          <p className="text-2xl font-bold">{weeklyRevenue.toLocaleString()}₫</p>
        </div>
        <div className="p-4 shadow rounded bg-purple-50 text-center">
          <h4 className="font-semibold text-lg">Doanh thu tháng</h4>
          <p className="text-2xl font-bold">{monthlyRevenue.toLocaleString()}₫</p>
        </div>
        <div className="p-4 shadow rounded bg-pink-50 text-center">
          <h4 className="font-semibold text-lg">Sản phẩm bán tuần</h4>
          <p className="text-2xl font-bold">{productsSoldWeek}</p>
        </div>
        <div className="p-4 shadow rounded bg-indigo-50 text-center">
          <h4 className="font-semibold text-lg">Sản phẩm bán tháng</h4>
          <p className="text-2xl font-bold">{productsSoldMonth}</p>
        </div>
      </div>

      {/* ======= Báo cáo tuần ======= */}
      <h3 className="text-center text-xl font-bold mb-2">Thống kê tuần</h3>
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

      {/* ======= Báo cáo tháng ======= */}
      <h3 className="text-center text-xl font-bold mb-2">Thống kê tháng</h3>
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
