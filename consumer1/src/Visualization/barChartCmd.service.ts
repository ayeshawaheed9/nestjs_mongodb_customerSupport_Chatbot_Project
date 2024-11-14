import { Injectable } from '@nestjs/common';
const Chart = require('cli-chart');

@Injectable()
export class BarChartCmdService {
  generateChart() {
    const chart = new Chart({
      xlabel: 'Products',
      ylabel: 'Orders',
      direction: 'y',
      width: 40,
      height: 20,
      lmargin: 10, // Left margin
      step: 4,     // Scale step
    });

    const products = ['Product A', 'Product B', 'Product C'];
    const orders = [10, 20, 30];

    // Define colors for each product
    const colors = ['red', 'green', 'blue'];

    // Plotting the chart
    orders.forEach((order, i) => {
      chart.addBar(order, products[i], colors[i]); // Specify the color for each bar
    });

    // Draw the chart
    chart.draw();

    // Manually print product labels above the bars
    const maxLabelLength = Math.max(...products.map(p => p.length));
    const labelOffset = ' '.repeat(maxLabelLength + 2); // Space to align labels above bars

    products.forEach((product, i) => {
      const orderValue = orders[i];
      const position = Math.round((orderValue / Math.max(...orders)) * chart.height); // Calculate vertical position for label
      console.log(`${labelOffset}${product} (${orderValue})`.padStart(position + labelOffset.length));
    });
  }
}
