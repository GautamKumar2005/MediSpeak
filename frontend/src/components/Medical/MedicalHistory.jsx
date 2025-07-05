import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';
import styled from 'styled-components';
import { Book, Plus, TestTube2, Pill, Clipboard, X } from 'lucide-react';

const HistoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const RecordCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => getRecordTypeColor(props.recordType)};
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const RecordTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 18px;
`;

const RecordDate = styled.span`
  color: #666;
  font-size: 14px;
`;

const RecordType = styled.span`
  background: ${props => getRecordTypeColor(props.recordType)};
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 500;
`;

const ParameterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const ParameterCard = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid ${props => getStatusColor(props.status)};
`;

const AddRecordButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 24px;
  
  &:hover {
    background: #0056b3;
  }
`;

const getRecordTypeColor = (type) => {
  const colors = {
    lab_report: '#28a745',
    prescription: '#17a2b8',
    diagnosis: '#ffc107',
    imaging: '#6f42c1',
    vaccination: '#20c997',
    other: '#6c757d'
  };
  return colors[type] || '#6c757d';
};

const getStatusColor = (status) => {
  const colors = {
    normal: '#28a745',
    high: '#ffc107',
    low: '#fd7e14',
    critical: '#dc3545'
  };
  return colors[status] || '#6c757d';
};

const MedicalHistory = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch medical records
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/medical/records');
        setRecords(response.data.records);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching medical records');
        toast.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // Delete medical record
  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/api/medical/records/${recordId}`);
        setRecords(records.filter(record => record._id !== recordId));
        toast.success('Record deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete record');
      }
    }
  };

  if (loading) return <div className="loading">Loading medical history...</div>;
  if (error) return <div className="error">Error loading medical history: {error}</div>;

  return (
    <HistoryContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2><Book size={24} style={{ marginRight: '8px' }} /> Medical History</h2>
        <AddRecordButton onClick={() => setShowAddForm(true)}>
          <Plus size={18} style={{ marginRight: '8px' }} /> Add New Record
        </AddRecordButton>
      </div>

      {records && records.length > 0 ? (
        records.map((record) => (
          <RecordCard key={record._id} recordType={record.recordType}>
            <RecordHeader>
              <div>
                <RecordTitle>{record.title}</RecordTitle>
                <RecordDate>{new Date(record.date).toLocaleDateString()}</RecordDate>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <RecordType recordType={record.recordType}>
                  {record.recordType.replace('_', ' ')}
                </RecordType>
                <button 
                  onClick={() => handleDeleteRecord(record._id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#dc3545', 
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </RecordHeader>

            {record.description && (
              <p style={{ color: '#666', marginBottom: '16px' }}>
                {record.description}
              </p>
            )}

            {record.doctor && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Doctor:</strong> {record.doctor.name}
                {record.doctor.specialty && ` (${record.doctor.specialty})`}
                {record.doctor.hospital && ` - ${record.doctor.hospital}`}
              </div>
            )}

            {record.parameters && record.parameters.length > 0 && (
              <div>
                <h4><TestTube2 size={18} style={{ marginRight: '8px' }} /> Test Results:</h4>
                <ParameterGrid>
                  {record.parameters.map((param, index) => (
                    <ParameterCard key={index} status={param.status}>
                      <div style={{ fontWeight: 'bold' }}>{param.name}</div>
                      <div>{param.value} {param.unit}</div>
                      {param.normalRange && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Normal: {param.normalRange}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: '12px', 
                        color: getStatusColor(param.status),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {param.status}
                      </div>
                    </ParameterCard>
                  ))}
                </ParameterGrid>
              </div>
            )}

            {record.medications && record.medications.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4><Pill size={18} style={{ marginRight: '8px' }} /> Medications:</h4>
                {record.medications.map((med, index) => (
                  <div key={index} style={{ 
                    background: '#e9ecef', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    <strong>{med.name}</strong> - {med.dosage}
                    {med.frequency && ` (${med.frequency})`}
                    {med.duration && ` for ${med.duration}`}
                  </div>
                ))}
              </div>
            )}

            {record.notes && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: '#f8f9fa', 
                borderRadius: '4px' 
              }}>
                <strong><Clipboard size={18} style={{ marginRight: '8px' }} /> Notes:</strong> {record.notes}
              </div>
            )}
          </RecordCard>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h3><Clipboard size={24} style={{ marginRight: '8px' }} /> No medical records found</h3>
          <p>Start by uploading your first medical document for analysis</p>
        </div>
      )}
    </HistoryContainer>
  );
};

export default MedicalHistory;