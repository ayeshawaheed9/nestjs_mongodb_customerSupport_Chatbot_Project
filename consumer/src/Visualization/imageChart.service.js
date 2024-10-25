const QuickChart = require('quickchart-js');
const fetch = require('node-fetch');

class ChartService {
  async generateOrderChart(orderSummary) {
    const chart = new QuickChart();

    // Define more colors for the doughnut chart
    const colors = [
      'rgba(255, 99, 132, 0.8)',    // Red
      'rgba(54, 162, 235, 0.8)',    // Blue
      'rgba(255, 206, 86, 0.8)',    // Yellow
      'rgba(75, 192, 192, 0.8)',    // Green
      'rgba(153, 102, 255, 0.8)',   // Purple
      'rgba(255, 159, 64, 0.8)',    // Orange
      'rgba(100, 255, 100, 0.8)',   // Light Green
      'rgba(200, 100, 255, 0.8)',   // Light Purple
      'rgba(0, 128, 128, 0.8)',     // Teal
      'rgba(255, 215, 0, 0.8)',     // Gold
    ];

    // Set the chart configuration
    chart.setConfig({
      type: 'doughnut',
      data: {
        labels: Object.keys(orderSummary), // Product names
        datasets: [
          {
            label: 'Order Quantity',
            data: Object.values(orderSummary), // Quantities
            backgroundColor: colors, // Assign different colors to each slice
            borderColor: colors.map(color => color.replace('0.2', '1')), // Set matching border colors
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          doughnutlabel: {
            labels: [
              {
                text: Object.values(orderSummary).reduce((a, b) => a + b, 0), // Total orders
                font: {
                  size: 20,
                },
              },
              {
                text: 'total',
              },
            ],
          },
        },
      },
    });

    // Get the chart image URL
    const chartUrl = chart.getUrl();

    // Fetch the image from the chart URL
    const response = await fetch(chartUrl);

    // Check if the response is okay
    if (!response.ok) {
      throw new Error('Failed to fetch chart image');
    }

    return response.buffer(); // Return the image buffer
  }
}

module.exports = ChartService;
