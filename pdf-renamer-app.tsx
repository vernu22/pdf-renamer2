import React, { useState } from 'react';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';

const PDFRenamer = () => {
  const [files, setFiles] = useState([]);
  const [renamedFiles, setRenamedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const extractProviderInfo = (content) => {
    const pattern = /Datos del beneficiario.*?CUIT\/CUIL\s*([\d-]+)\s*Nombre\/Razón social\s*(.*?)\s*Banco destino/s;
    const match = content.match(pattern);
    
    if (match) {
      const cuit = match[1].trim();
      let providerName = match[2].trim();
      // Limpiar el nombre de caracteres especiales y espacios
      providerName = providerName.replace(/[^\w\s.-]/g, '');
      providerName = providerName.replace(/\s+/g, '_');
      return `${cuit}_${providerName}`;
    }
    return null;
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
    setRenamedFiles(renamedFiles.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    setProcessing(true);
    setError('');
    const processed = [];

    try {
      for (const file of files) {
        const text = await file.text();
        const newName = extractProviderInfo(text);
        
        if (newName) {
          const renamedFile = new File(
            [file],
            `${newName}.pdf`,
            { type: file.type }
          );
          processed.push(renamedFile);
        } else {
          setError(`No se pudo procesar el archivo: ${file.name}`);
          processed.push(file);
        }
      }
      
      setRenamedFiles(processed);
    } catch (err) {
      setError('Error al procesar los archivos: ' + err.message);
    }
    
    setProcessing(false);
  };

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    renamedFiles.forEach(file => {
      downloadFile(file);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Renombrador de PDFs</h1>
        
        {/* Upload Section */}
        <div className="mb-6">
          <label 
            htmlFor="file-upload"
            className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Haga clic para subir</span> o arrastre y suelte
              </p>
              <p className="text-xs text-gray-500">PDFs (máximo 10 archivos)</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Archivos cargados</h2>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={processFiles}
            disabled={files.length === 0 || processing}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {processing ? 'Procesando...' : 'Procesar archivos'}
          </button>

          {renamedFiles.length > 0 && (
            <button
              onClick={downloadAll}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar todos
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFRenamer;
