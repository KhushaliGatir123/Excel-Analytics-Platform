import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import Plotly from "react-plotly.js";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactDOM from "react-dom";
import jwtDecode from "jwt-decode";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components and plugin
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

const UserDashboard = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedXAxis, setSelectedXAxis] = useState("");
  const [selectedYAxis, setSelectedYAxis] = useState("");
  const [selectedGraphTypes, setSelectedGraphTypes] = useState([]);
  const [graphHistory, setGraphHistory] = useState([]);
  const [previewGraph, setPreviewGraph] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const chartRefs = useRef({});
  const graphRefs = useRef({});
  const fileInputRef = useRef(null);
  const graphTypes = ["Bar", "Line", "Pie", "Scatter", "3D Bar", "3D Line"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in again.");
          toast.error("No authentication token found");
          navigate("/login");
          return;
        }
        const decoded = jwtDecode(token);
        setUsername(decoded.username || "User");

        const [filesRes, graphsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/files", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/files/graphs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setFiles(filesRes.data.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)));
        setGraphHistory(graphsRes.data.map((graph) => ({
          id: graph._id,
          fileName: graph.fileName,
          xAxis: graph.xAxis,
          yAxis: graph.yAxis,
          types: graph.types,
          timestamp: graph.timestamp,
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        setError("");
      } catch (error) {
        setError("Failed to load data: " + (error.response?.data?.msg || error.message));
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setError("");
    setFileUploaded(false);
    setSelectedXAxis("");
    setSelectedYAxis("");
    setSelectedGraphTypes([]);
  };

  const handleGraphTypeChange = (e) => {
    const value = e.target.value;
    setSelectedGraphTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      toast.error("Please select a file");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        toast.error("No authentication token found");
        navigate("/login");
        return;
      }
      const res = await axios.post("http://localhost:5000/api/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFiles([res.data.file, ...files].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)));
      setSelectedFile(res.data.file);
      setFileUploaded(true);
      setError("");
      toast.success("File uploaded successfully! Select axes and graph types.");
    } catch (error) {
      setError("Upload failed: " + (error.response?.data?.msg || error.message));
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateGraph = async () => {
    if (!selectedFile || !selectedXAxis || !selectedYAxis || selectedGraphTypes.length === 0) {
      setError("Please select axes and at least one graph type");
      toast.error("Please select axes and at least one graph type");
      return;
    }
    setGenerating(true);
    const newGraph = {
      fileName: selectedFile.filename,
      xAxis: selectedXAxis,
      yAxis: selectedYAxis,
      types: [...selectedGraphTypes],
      timestamp: new Date().toLocaleString(),
    };
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/files/graphs", newGraph, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const savedGraph = { id: res.data._id, ...newGraph };
      setGraphHistory([savedGraph, ...graphHistory]);
      setPreviewGraph(savedGraph);
      setIsPreviewOpen(true);
      setError("");
      toast.success("Graph generated successfully");
      setFile(null);
      setSelectedFile(null);
      setSelectedXAxis("");
      setSelectedYAxis("");
      setSelectedGraphTypes([]);
      setFileUploaded(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setError("Failed to save graph: " + (error.response?.data?.msg || error.message));
      toast.error("Failed to save graph");
    } finally {
      setGenerating(false);
    }
  };

  const handleClearForm = () => {
    setFile(null);
    setSelectedFile(null);
    setSelectedXAxis("");
    setSelectedYAxis("");
    setSelectedGraphTypes([]);
    setFileUploaded(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getAllColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const getNumericalColumns = (data) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter((key) =>
      data.every((row) => !isNaN(parseFloat(row[key])) && isFinite(row[key]))
    );
  };

  const getChartData = (file, xAxis, yAxis) => {
    if (!file || !xAxis || !yAxis) return null;
    const labels = file.data.map((row) => row[xAxis] || `Row ${file.data.indexOf(row) + 1}`);
    const values = file.data.map((row) => parseFloat(row[yAxis]));
    return {
      labels,
      datasets: [
        {
          label: yAxis,
          data: values,
          backgroundColor: "rgba(104, 187, 227, 0.5)", // #68BBE3
          borderColor: "rgba(14, 134, 212, 1)", // #0E86D4
          borderWidth: 2,
          pointRadius: 5,
          fill: false,
        },
      ],
    };
  };

  const getChartOptions = (xAxis, yAxis, type) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#FFFFFF", font: { size: 14, weight: "bold" } } },
      title: {
        display: true,
        text: `${yAxis} vs. ${xAxis} (${type})`,
        color: "#FFFFFF",
        font: { size: 16, weight: "bold" },
      },
      datalabels: {
        display: type === "Pie",
        color: "#FFFFFF",
        font: { size: 12, weight: "bold" },
        formatter: (value, context) => {
          if (type === "Pie") {
            const sum = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / sum) * 100).toFixed(1) + "%";
            return `${context.chart.data.labels[context.dataIndex]}: ${percentage}`;
          }
          return value;
        },
      },
    },
    scales: type !== "Pie" ? {
      x: {
        title: { display: true, text: xAxis, color: "#FFFFFF", font: { size: 14 } },
        ticks: { color: "#FFFFFF" },
      },
      y: {
        title: { display: true, text: yAxis, color: "#FFFFFF", font: { size: 14 } },
        ticks: { color: "#FFFFFF" },
      },
    } : undefined,
  });

  const getPlotlyData = (file, xAxis, yAxis, type) => {
    if (!file || !xAxis || !yAxis) return [];
    const x = file.data.map((row) => row[xAxis] || `Row ${file.data.indexOf(row) + 1}`);
    const y = file.data.map((row) => parseFloat(row[yAxis]));
    const z = Array(x.length).fill(0);
    return [
      {
        x,
        y,
        z,
        type: type === "3D Bar" ? "bar" : "scatter3d",
        mode: type === "3D Line" ? "lines+markers" : undefined,
        marker: { color: "#0E86D4", size: 5 },
        line: type === "3D Line" ? { color: "#0E86D4", width: 2 } : undefined,
        name: yAxis,
      },
    ];
  };

  const getPlotlyLayout = (xAxis, yAxis, type) => ({
    title: {
      text: `${yAxis} vs. ${xAxis} (${type})`,
      font: { color: "#FFFFFF", size: 16, family: "Arial, bold" },
    },
    scene: {
      xaxis: { title: { text: xAxis, font: { color: "#FFFFFF", size: 14 } }, tickfont: { color: "#FFFFFF" } },
      yaxis: { title: { text: yAxis, font: { color: "#FFFFFF", size: 14 } }, tickfont: { color: "#FFFFFF" } },
      zaxis: { title: { text: "Value", font: { color: "#FFFFFF", size: 14 } }, tickfont: { color: "#FFFFFF" } },
    },
    margin: { l: 30, r: 30, b: 30, t: 50 },
    paper_bgcolor: "#FFFFFF",
    plot_bgcolor: "#F5F5F5",
    width: type === "Pie" ? 300 : 500,
    height: type === "Pie" ? 300 : 400,
  });

  const handlePreviewGraph = (graph) => {
    setPreviewGraph(graph);
    setIsPreviewOpen(true);
  };

  const downloadPDF = async (graph) => {
    try {
      const file = files.find((f) => f.filename === graph.fileName);
      if (!file) {
        console.error("File not found for graph:", graph.fileName);
        toast.error("File not found for graph");
        return;
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 10;

      for (const type of graph.types) {
        const isPie = type === "Pie";
        const chartWidth = isPie ? 300 : 500;
        const chartHeight = isPie ? 300 : 400;

        const tempContainer = document.createElement("div");
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.width = `${chartWidth}px`;
        tempContainer.style.height = `${chartHeight}px`;
        tempContainer.style.backgroundColor = "#FFFFFF";
        document.body.appendChild(tempContainer);

        try {
          const chartData = getChartData(file, graph.xAxis, graph.yAxis);
          const plotlyData = getPlotlyData(file, graph.xAxis, graph.yAxis, type);
          let chartElement = document.createElement("div");
          tempContainer.appendChild(chartElement);

          if (["Bar", "Line", "Pie", "Scatter"].includes(type)) {
            const ChartComponent = { Bar, Line, Pie, Scatter }[type];
            const chartInstance = React.createElement(ChartComponent, {
              data: chartData,
              options: getChartOptions(graph.xAxis, graph.yAxis, type),
              width: chartWidth,
              height: chartHeight,
            });
            ReactDOM.render(chartInstance, chartElement);
          } else if (["3D Bar", "3D Line"].includes(type)) {
            const plotlyInstance = React.createElement(Plotly, {
              data: plotlyData,
              layout: getPlotlyLayout(graph.xAxis, graph.yAxis, type),
            });
            ReactDOM.render(plotlyInstance, chartElement);
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            logging: true,
            windowWidth: chartWidth,
            windowHeight: chartHeight,
          });

          if (canvas.width === 0 || canvas.height === 0) {
            console.error(`Canvas is empty for graph type ${type}`);
            throw new Error(`Canvas is empty for graph type ${type}`);
          }

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = isPie ? 100 : 180;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          if (currentY + imgHeight > pageHeight - 20) {
            pdf.addPage();
            currentY = 10;
          }
          pdf.addImage(imgData, "PNG", (pageWidth - imgWidth) / 2, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
        } catch (error) {
          console.error(`Failed to render graph type ${type}:`, error);
          throw error;
        } finally {
          document.body.removeChild(tempContainer);
        }
      }

      pdf.save(`${graph.fileName}_${graph.xAxis}_vs_${graph.yAxis}_${graph.types.join("_")}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  };

  const renderGraph = (graph, type) => {
    const file = files.find((f) => f.filename === graph.fileName);
    if (!file) return null;
    const chartData = getChartData(file, graph.xAxis, graph.yAxis);
    const plotlyData = getPlotlyData(file, graph.xAxis, graph.yAxis, type);
    return (
      <div key={type} className="mb-4 bg-[#F5F5F5] rounded-lg p-4 shadow-md">
        {type === "Bar" && (
          <Bar
            data={chartData}
            options={getChartOptions(graph.xAxis, graph.yAxis, "Bar")}
            width={500}
            height={400}
          />
        )}
        {type === "Line" && (
          <Line
            data={chartData}
            options={getChartOptions(graph.xAxis, graph.yAxis, "Line")}
            width={500}
            height={400}
          />
        )}
        {type === "Pie" && (
          <Pie
            data={chartData}
            options={getChartOptions(graph.xAxis, graph.yAxis, "Pie")}
            width={300}
            height={300}
          />
        )}
        {type === "Scatter" && (
          <Scatter
            data={chartData}
            options={getChartOptions(graph.xAxis, graph.yAxis, "Scatter")}
            width={500}
            height={400}
          />
        )}
        {type === "3D Bar" && (
          <Plotly
            data={plotlyData}
            layout={getPlotlyLayout(graph.xAxis, graph.yAxis, "3D Bar")}
            style={{ width: "100%", height: "400px" }}
          />
        )}
        {type === "3D Line" && (
          <Plotly
            data={plotlyData}
            layout={getPlotlyLayout(graph.xAxis, graph.yAxis, "3D Line")}
            style={{ width: "100%", height: "400px" }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white flex">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {/* Sidebar */}
      <div className="w-64 bg-[#055C9D] shadow-md p-6 fixed h-full flex flex-col space-y-6">
        <h1 className="text-2xl font-bold text-white">Excel Analytics</h1>
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full text-left p-2 rounded-lg font-medium text-white ${
                activeSection === "dashboard" ? "bg-[#003060]" : "hover:bg-[#0E86D4]"
              } transition-colors duration-200`}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("upload")}
              className={`w-full text-left p-2 rounded-lg font-medium text-white ${
                activeSection === "upload" ? "bg-[#003060]" : "hover:bg-[#0E86D4]"
              } transition-colors duration-200`}
            >
              Upload New Files
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection("history")}
              className={`w-full text-left p-2 rounded-lg font-medium text-white ${
                activeSection === "history" ? "bg-[#003060]" : "hover:bg-[#0E86D4]"
              } transition-colors duration-200`}
            >
              Uploaded Files
            </button>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#003060] text-white font-medium rounded-lg hover:bg-[#0E86D4] transition-colors duration-200"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8 bg-white">
        <div className="max-w-5xl mx-auto">
          {activeSection === "dashboard" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-[#003060] mb-4">
                Welcome, {username}
              </h2>
              <p className="text-lg text-[#055C9D] mb-8">
                Transform your data into stunning visualizations with ease.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-lg font-medium text-[#003060]">Uploaded Files</h3>
                  <p className="text-4xl font-bold text-[#68BBE3] mt-2">{files.length}</p>
                  <p className="text-[#055C9D] mt-1">Total files uploaded</p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-lg font-medium text-[#003060]">Charts Created</h3>
                  <p className="text-4xl font-bold text-[#68BBE3] mt-2">{graphHistory.length}</p>
                  <p className="text-[#055C9D] mt-1">Total charts generated</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "upload" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#003060] mb-4">Upload New File</h2>
              {error && <p className="text-[#FF5E5E] mb-4">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#055C9D] mb-2">Select Excel File</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="p-2 border border-[#055C9D] rounded-lg w-full bg-white text-[#003060] focus:ring-2 focus:ring-[#0E86D4]"
                  />
                  {file && <p className="mt-2 text-sm text-[#055C9D]">Selected: {file.name}</p>}
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`px-6 py-2 bg-[#003060] text-white font-medium rounded-lg hover:bg-[#0E86D4] transition-colors duration-200 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="px-6 py-2 bg-white text-[#003060] font-medium rounded-lg border border-[#055C9D] hover:bg-[#0E86D4] hover:text-white transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              </form>
              {fileUploaded && selectedFile && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-[#003060] mb-4">Create Visualization</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-[#055C9D] mb-2">X-Axis Column</label>
                      <select
                        value={selectedXAxis}
                        onChange={(e) => setSelectedXAxis(e.target.value)}
                        className="w-full p-2 border border-[#055C9D] rounded-lg bg-white text-[#003060] focus:ring-2 focus:ring-[#0E86D4]"
                      >
                        <option value="">Select an x-axis column</option>
                        {getAllColumns(selectedFile.data).map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#055C9D] mb-2">Y-Axis Column (Numerical)</label>
                      <select
                        value={selectedYAxis}
                        onChange={(e) => setSelectedYAxis(e.target.value)}
                        className="w-full p-2 border border-[#055C9D] rounded-lg bg-white text-[#003060] focus:ring-2 focus:ring-[#0E86D4]"
                      >
                        <option value="">Select a y-axis column</option>
                        {getNumericalColumns(selectedFile.data).map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#055C9D] mb-2">Graph Types</label>
                      <div className="w-full p-2 border border-[#055C9D] rounded-lg bg-white">
                        {graphTypes.map((type) => (
                          <label key={type} className="flex items-center space-x-2 mb-2">
                            <input
                              type="checkbox"
                              value={type}
                              checked={selectedGraphTypes.includes(type)}
                              onChange={handleGraphTypeChange}
                              className="h-4 w-4 text-[#0E86D4] focus:ring-[#0E86D4] border-[#055C9D] rounded"
                            />
                            <span className="text-sm text-[#003060]">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateGraph}
                    disabled={generating}
                    className={`px-8 py-3 bg-[#003060] text-white font-medium rounded-lg hover:bg-[#0E86D4] transition-colors duration-200 ${generating ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {generating ? "Generating..." : "Generate Graph"}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "history" && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#003060] mb-4">Uploaded Files and Graphs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-[#055C9D] mb-3">File Upload History</h3>
                  {files.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {files.map((file) => (
                        <div key={file._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                          <div className="text-sm text-[#055C9D]">
                            <p><strong>File:</strong> {file.filename}</p>
                            <p><strong>Uploaded:</strong> {new Date(file.uploadDate).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#055C9D] font-medium">No files uploaded yet.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#055C9D] mb-3">Graph History</h3>
                  {graphHistory.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {graphHistory.map((graph) => (
                        <div key={graph.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                          <div
                            ref={(el) => (graphRefs.current[graph.id] = el)}
                            className="w-full h-auto hidden"
                          >
                            {graph.types.map((type) => renderGraph(graph, type))}
                          </div>
                          <div className="text-sm text-[#055C9D] mb-2">
                            <p><strong>File:</strong> {graph.fileName}</p>
                            <p><strong>X-Axis:</strong> {graph.xAxis}</p>
                            <p><strong>Y-Axis:</strong> {graph.yAxis}</p>
                            <p><strong>Graph Types:</strong> {graph.types.join(", ")}</p>
                            <p><strong>Created:</strong> {graph.timestamp}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePreviewGraph(graph)}
                              className="px-3 py-1 bg-[#003060] text-white text-sm font-medium rounded-lg hover:bg-[#0E86D4] transition-colors duration-200"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => downloadPDF(graph)}
                              className="px-3 py-1 bg-[#003060] text-white text-sm font-medium rounded-lg hover:bg-[#0E86D4] transition-colors duration-200"
                            >
                              Download PDF
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#055C9D] font-medium">No graphs created yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && previewGraph && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#003060] mb-4">
              Preview: {previewGraph.fileName} ({previewGraph.xAxis} vs {previewGraph.yAxis})
            </h2>
            <div className="space-y-4">
              {previewGraph.types.map((type) => (
                <div key={type} className="bg-[#F5F5F5] p-4 rounded-lg">
                  {renderGraph(previewGraph, type)}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-white text-[#003060] font-medium rounded-lg border border-[#055C9D] hover:bg-[#0E86D4] hover:text-white transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  downloadPDF(previewGraph);
                  setIsPreviewOpen(false);
                }}
                className="px-4 py-2 bg-[#003060] text-white font-medium rounded-lg hover:bg-[#0E86D4] transition-colors duration-200"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;