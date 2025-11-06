import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async () => {
    if (!file || !columns.trim()) {
      alert('Please select a file and enter at least one column name.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    columns.split(',').forEach(col => formData.append('columns', col.trim()));

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/api/upload/', formData);
      setResult(response.data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setResult({ error: error.response.data.error });
      } else {
        setResult({ error: 'Upload failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <main className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Upload Excel File</h2>

        <div className="space-y-4">
          <div
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
              isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <span className="text-gray-600">
              {file ? file.name : 'Click or drag an Excel file here'}
            </span>
            <input
              id="fileInput"
              name="file"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          <input
            id="columnsInput"
            name="columns"
            type="text"
            placeholder="Enter column names separated by commas"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <button
            onClick={handleUpload}
            disabled={!file || !columns.trim() || loading}
            className={`w-full py-3 text-lg rounded-lg text-white font-semibold ${
              (!file || !columns.trim() || loading)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {result && (
          <div className="mt-8">
            {result.error ? (
              <div className="text-red-600 font-semibold text-center">
                {result.error}
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">Summary</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg text-center">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="px-4 py-3">Sheet</th>
                        <th className="px-4 py-3">Column</th>
                        <th className="px-4 py-3">Sum</th>
                        <th className="px-4 py-3">Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.summary.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-3">{item.sheet}</td>
                          <td className="px-4 py-3">{item.column}</td>
                          <td className="px-4 py-3">{item.sum}</td>
                          <td className="px-4 py-3">{item.avg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">JSON Output</h4>
                  <pre className="text-sm bg-gray-800 text-green-300 p-4 rounded overflow-x-auto">
                    {JSON.stringify(
                      {
                        file: result.file,
                        summary: result.summary.map(({ column, sum, avg }) => ({
                          column,
                          sum,
                          avg
                        }))
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
