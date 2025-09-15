import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// --- Data is now structured for easier export ---
const dailyPerformanceData = [
    { label: 'Total Trains', value: '156' },
    { label: 'On Time', value: '153 (98.1%)', color: 'text-green-600' },
    { label: 'Delayed', value: '3 (1.9%)', color: 'text-yellow-500' },
    { label: 'Avg Delay', value: '2.1 min' },
];

const aiRecommendationsData = [
    { label: 'Generated', value: '47' },
    { label: 'Accepted', value: '42 (89.4%)', color: 'text-green-600' },
    { label: 'Overridden', value: '5 (10.6%)', color: 'text-yellow-500' },
    { label: 'Avg Confidence', value: '87.3%' },
];


const Reports = () => {
    // A ref to capture the report card div for PDF export
    const reportRef = useRef();

    // --- PDF Export Handler ---
    const handleExportPDF = () => {
        const input = reportRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2 }) // Use scale for better resolution
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                // A4 dimensions: 210mm wide, 297mm tall
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 15; // Margin from top

                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                pdf.save(`Performance_Report_${new Date().toLocaleDateString()}.pdf`);
            });
    };

    // --- Excel Export Handler ---
    const handleExportExcel = () => {
        // Create worksheets for each data set
        const dailyWs = XLSX.utils.json_to_sheet(dailyPerformanceData.map(item => ({ Metric: item.label, Value: item.value })));
        const aiWs = XLSX.utils.json_to_sheet(aiRecommendationsData.map(item => ({ Metric: item.label, Value: item.value })));

        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Add the worksheets to the workbook
        XLSX.utils.book_append_sheet(wb, dailyWs, "Daily Performance");
        XLSX.utils.book_append_sheet(wb, aiWs, "AI Recommendations");

        // Write the workbook and trigger a download
        XLSX.writeFile(wb, `Performance_Report_${new Date().toLocaleDateString()}.xlsx`);
    };


    return (<> <div className="flex w-full  bg-blue-200 items-center justify-between  px-8 lg:px-24 py-20  font-sans">
        
        {/* Text container: Now on the left */}
        <div className="flex-grow">
          <h1 className="text-5xl lg:text-5xl font-bold text-slate-900">
            Analyze,
          </h1> 
          <h1 className="text-5xl lg:text-5xl font-bold text-blue-900">
            Predict
          </h1> 
          <h1 className="text-5xl lg:text-5xl font-bold text-slate-900">
            And Optimize
          </h1>
           <p className="text-lg text-slate-500">
           Make data-driven decisions with ease by monitoring train performance and punctuality, identifying delays, and optimizing schedules to ensure smooth and efficient operations
          </p>
        </div>

        {/* Image container: Made MUCH larger */}
        <div className="relative h-[340px] w-[460px] flex-shrink-0 hidden md:block">
          
          {/* Bigger image: Size increased to 320px */}
          <img
            src="/images/silver-ringvee-Q6F08X4Okd8-unsplash.jpg"
            alt="Indian Railways"
            className="absolute top-0 left-0 h-[320px] w-[320px] rounded-full object-cover border-4 border-white shadow-lg z-20"
          />

          {/* Smaller image: Size increased to 260px and repositioned */}
          <img
            src="/images/wilsan-u-WUxK_YFdhQU-unsplash.jpg"
            alt="Railway Network"
            className="absolute top-[80px] left-[200px] h-[260px] w-[260px] rounded-full object-cover border-4 border-white shadow-lg z-10"
          />
        </div>
      </div>
        <div className="flex-1 p-3 lg:p-6">
            <div ref={reportRef} className="bg-blue-50 border border-gray-200 rounded-xl p-3 lg:p-6">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Performance Reports</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
                    
                    {/* Daily Performance Card (now maps over data) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-4">Daily Performance</h3>
                        <div className="space-y-3">
                            {dailyPerformanceData.map((item) => (
                                <div key={item.label} className="flex justify-between">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span className={`font-medium ${item.color || 'text-gray-900'}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Recommendations Card (now maps over data) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-4">AI Recommendations</h3>
                        <div className="space-y-3">
                            {aiRecommendationsData.map((item) => (
                                <div key={item.label} className="flex justify-between">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span className={`font-medium ${item.color || 'text-gray-900'}`}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Buttons with onClick handlers */}
                <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row gap-2 lg:gap-4">
                    <button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base flex items-center justify-center space-x-2"><span>📄</span><span>Export PDF</span></button>
                    <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-3 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base flex items-center justify-center space-x-2"><span>📊</span><span>Export Excel</span></button>
                </div>
            </div>
        </div>
        </>
    );
};

export default Reports;