import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Modal, Form, Upload, Tag, Typography, Tooltip, Space, Badge } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { apiFetch, apiUpload } from '../../utils/api';
import { toast } from 'sonner';

const { Option } = Select;
const { Dragger } = Upload;
const { Text } = Typography;

const ExamsSection: React.FC = () => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exmData, deptData] = await Promise.all([
        apiFetch('/exams/'),
        apiFetch('/departments/'),
      ]);
      setExams(exmData?.results || (Array.isArray(exmData) ? exmData : []));
      setDepartments(deptData?.results || (Array.isArray(deptData) ? deptData : []));
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewExam = async (exam: any) => {
    setSelectedExam(exam);
    setIsViewModalOpen(true);
    setQuestionsLoading(true);
    try {
      const data = await apiFetch(`/exams/${exam.id}/`);
      setQuestions(data.questions || []);
    } catch {
      toast.error("Savollarni yuklashda xatolik yuz berdi");
      setQuestions([]);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (fileList.length === 0) return toast.error("Iltimos, Excel faylni yuklang");

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('department_id', values.department_id);
    formData.append('duration', values.duration);
    formData.append('passing_score', values.passing_score || '35');
    formData.append('file', fileList[0].originFileObj || fileList[0]);

    try {
      setLoading(true);
      await apiUpload('/exams/create/', formData);
      toast.success("Test va savollar muvaffaqiyatli yuklandi");
      setView('list');
      setFileList([]);
      fetchData();
      form.resetFields();
    } catch {
      toast.error("Yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: <span className="text-white">Testni o'chirish</span>,
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: <span className="text-slate-400">Test o'chirilsa, uning barcha savollari ham o'chib ketadi.</span>,
      okText: "O'chirish",
      okType: 'danger',
      centered: true,
      className: 'dark-confirm-modal',
      onOk: async () => {
        try {
          await apiFetch(`/exams/${id}/delete/`, { method: 'DELETE' });
          toast.success("Test o'chirildi");
          fetchData();
        } catch {
          toast.error("O'chirishda xatolik");
        }
      },
    });
  };

  // --- MOBILE CARD ---
  const MobileCard = ({ record }: { record: any }) => (
    <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-sm m-0 truncate">{record.title}</p>
          <Tag color="blue" className="bg-blue-500/10 border-none text-[10px] uppercase font-bold mt-1">
            {record.department || 'Umumiy'}
          </Tag>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined className="text-blue-400" />}
            onClick={() => handleViewExam(record)}
            className="hover:bg-blue-500/10 rounded-lg"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-500/10 rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <FileTextOutlined className="text-blue-400" />
          <span>{record.questions_count || 0} ta savol</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-xs">
          <ClockCircleOutlined className="text-amber-400" />
          <span>{record.duration} daqiqa</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <CheckCircleOutlined className="text-emerald-500" />
          <span className="text-emerald-400 font-bold">{record.passing_score || 35}%</span>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      title: "Test va Bo'lim",
      key: 'test_info',
      render: (r: any) => (
        <div className="flex flex-col gap-1">
          <Text className="text-white font-semibold text-base">{r.title}</Text>
          <Tag color="blue" className="bg-blue-500/10 border-none text-[10px] uppercase font-bold w-fit">
            {r.department || 'Umumiy'}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Savollar',
      dataIndex: 'questions_count',
      align: 'center' as const,
      responsive: ['sm'] as any,
      render: (c: any) => (
        <div className="flex items-center justify-center gap-1.5 text-slate-300 bg-slate-800/50 px-3 py-1 rounded-full w-fit mx-auto">
          <FileTextOutlined className="text-blue-400" />
          <span className="font-bold">{c || 0} ta</span>
        </div>
      ),
    },
    {
      title: 'Davomiyligi',
      dataIndex: 'duration',
      responsive: ['md'] as any,
      render: (d: any) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <ClockCircleOutlined className="text-amber-400" />
          <span>{d} daqiqa</span>
        </div>
      ),
    },
    {
      title: "O'tish balli",
      dataIndex: 'passing_score',
      responsive: ['md'] as any,
      render: (s: any) => (
        <div className="flex items-center gap-1.5">
          <CheckCircleOutlined className="text-emerald-500" />
          <span className="text-emerald-400 font-bold">{s || 35}%</span>
        </div>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      align: 'right' as const,
      render: (r: any) => (
        <Space>
          <Tooltip title="Ko'rish">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewExam(r)}
              className="text-blue-400 hover:bg-blue-500/10"
            />
          </Tooltip>
          <Tooltip title="O'chirish">
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(r.id)}
              className="hover:bg-red-500/10"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // --- ADD VIEW ---
  if (view === 'add') {
    return (
      <div className="p-3 sm:p-6 animate-in slide-in-from-right duration-500">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setView('list')}
            className="bg-slate-800 border-none text-white hover:bg-slate-700 h-9 w-9 sm:h-10 sm:w-10 rounded-xl shrink-0"
          />
          <h2 className="text-lg sm:text-2xl font-bold text-white m-0">Yangi test yaratish</h2>
        </div>

        <div className="w-full max-w-2xl bg-[#0f172a] p-5 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ passing_score: 35 }}>
            <Form.Item
              label={<span className="text-slate-400 text-sm">Test nomi</span>}
              name="title"
              rules={[{ required: true, message: 'Nomini kiriting' }]}
            >
              <Input
                placeholder="Masalan: React JS Asoslari"
                className="h-11 sm:h-12 bg-slate-900 border-slate-800 text-white rounded-xl focus:border-blue-500"
              />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Form.Item
                label={<span className="text-slate-400 text-sm">Bo'lim</span>}
                name="department_id"
                rules={[{ required: true, message: "Bo'limni tanlang" }]}
              >
                <Select placeholder="Tanlang" className="h-11 sm:h-12 custom-select-dark">
                  {departments.map((d: any) => (
                    <Option key={d.id} value={d.id}>{d.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={<span className="text-slate-400 text-sm">Vaqt (daqiqa)</span>}
                name="duration"
                rules={[{ required: true, message: 'Vaqtni kiriting' }]}
              >
                <Input
                  type="number"
                  placeholder="45"
                  className="h-11 sm:h-12 bg-slate-900 border-slate-800 text-white rounded-xl focus:border-blue-500"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="text-slate-400 text-sm">O'tish balli (%)</span>}
              name="passing_score"
            >
              <Input
                type="number"
                placeholder="35"
                className="h-11 sm:h-12 bg-slate-900 border-slate-800 text-white rounded-xl focus:border-blue-500"
              />
            </Form.Item>

            <Form.Item label={<span className="text-slate-400 text-sm">Excel fayl (.xlsx)</span>}>
              <Dragger
                beforeUpload={(file) => { setFileList([file]); return false; }}
                fileList={fileList}
                onRemove={() => setFileList([])}
                accept=".xlsx"
                className="bg-slate-900/50 border-slate-800 border-dashed rounded-2xl p-4 sm:p-6 hover:border-blue-500 transition-colors"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-blue-500 text-3xl sm:text-4xl" />
                </p>
                <p className="text-slate-300 font-medium text-sm sm:text-base mt-2">
                  Faylni shu yerga tashlang yoki tanlang
                </p>
                <p className="text-slate-500 text-xs">Faqat .xlsx formatidagi fayllar qabul qilinadi</p>
              </Dragger>
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-12 sm:h-14 bg-blue-600 border-none rounded-2xl font-bold text-base sm:text-lg mt-4 shadow-lg shadow-blue-600/20"
            >
              Saqlash va Yuklash
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-3 sm:p-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-8 bg-slate-900/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white m-0">Testlar boshqaruvi</h1>
          <Text className="text-slate-500 text-sm">Jami {exams.length} ta test bazada mavjud</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setView('add')}
          className="h-11 sm:h-12 px-4 sm:px-6 bg-blue-600 border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 self-start sm:self-auto"
        >
          <span className="hidden sm:inline">Yangi test qo'shish</span>
          <span className="sm:hidden">Qo'shish</span>
        </Button>
      </div>

      {/* Jadval / Mobile kartalar */}
      {isMobile ? (
        <div>
          {exams.length === 0 && !loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Testlar mavjud emas</div>
          ) : (
            exams.map((exam: any) => <MobileCard key={exam.id} record={exam} />)
          )}
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <Table
            columns={columns}
            dataSource={exams}
            loading={loading}
            rowKey="id"
            className="custom-dark-table"
            pagination={{ pageSize: 7, className: 'p-4', showSizeChanger: false }}
            scroll={{ x: 500 }}
          />
        </div>
      )}

      {/* VIEW QUESTIONS MODAL */}
      <Modal
        title={null}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: 800 }}
        centered
        closeIcon={null}
        modalRender={(modal) => (
          <div className="bg-[#0b1120] border border-slate-800 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl">
            {modal}
          </div>
        )}
      >
        {selectedExam && (
          <div className="p-5 sm:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-5 sm:mb-8 gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-blue-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                  <FileTextOutlined className="text-blue-500 text-lg sm:text-2xl" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-white text-base sm:text-xl font-bold m-0 truncate">
                    {selectedExam.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Tag className="bg-slate-800 border-none text-slate-400 text-[10px] uppercase font-bold m-0">
                      {selectedExam.department}
                    </Tag>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <ClockCircleOutlined /> {selectedExam.duration} daqiqa
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="text"
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full shrink-0"
              >✕</Button>
            </div>

            {/* Stats bar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4 sm:gap-6">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider m-0">Jami savollar</p>
                  <p className="text-white text-base sm:text-lg font-bold m-0">{questions.length} ta</p>
                </div>
                <div className="w-[1px] h-8 bg-slate-800" />
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider m-0">O'tish chegarasi</p>
                  <p className="text-emerald-400 text-base sm:text-lg font-bold m-0">{selectedExam.passing_score}%</p>
                </div>
              </div>
              <Badge
                status="processing"
                color="#3b82f6"
                text={<span className="text-blue-400 text-xs font-medium italic">Savollar ro'yxati</span>}
              />
            </div>

            {/* Savollar */}
            <div className="max-h-[55vh] sm:max-h-[500px] overflow-y-auto pr-1 custom-scrollbar space-y-3 sm:space-y-4">
              {questionsLoading ? (
                <div className="py-16 text-center text-slate-500 animate-pulse">Savollar yuklanmoqda...</div>
              ) : questions.length > 0 ? (
                questions.map((q: any, idx: number) => (
                  <div key={q.id} className="bg-slate-900/40 border border-slate-800 p-4 sm:p-5 rounded-2xl">
                    <p className="text-white font-medium mb-3 text-sm sm:text-base">
                      <span className="text-blue-500 mr-2">{idx + 1}.</span> {q.text}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options?.map((opt: any) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm flex justify-between items-center gap-2 ${opt.is_correct
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400'
                            }`}
                        >
                          <span className="truncate">{opt.text}</span>
                          {opt.is_correct && <CheckCircleOutlined className="shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 sm:py-16 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                  <QuestionCircleOutlined className="text-slate-700 text-4xl mb-3" />
                  <p className="text-slate-600 italic text-sm">Ushbu testda savollar mavjud emas</p>
                </div>
              )}
            </div>

            <Button
              block
              onClick={() => setIsViewModalOpen(false)}
              className="mt-5 sm:mt-8 h-11 sm:h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold"
            >
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamsSection;