import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Modal, Form, Upload, Tag, Typography, Tooltip } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
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
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exmData, deptData] = await Promise.all([
        apiFetch('/exams/'),
        apiFetch('/departments/')
      ]);
      setExams(exmData || []);
      setDepartments(deptData || []);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onFinish = async (values: any) => {
    if (fileList.length === 0) return toast.error("Iltimos, Excel faylni yuklang");

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('department_id', values.department_id);
    formData.append('duration', values.duration);
    formData.append('passing_score', values.passing_score || "35");
    formData.append('file', fileList[0].originFileObj || fileList[0]);

    try {
      setLoading(true);
      await apiUpload('/exams/create/', formData);
      toast.success("Test va savollar muvaffaqiyatli yuklandi");
      setView('list');
      setFileList([]);
      fetchData();
      form.resetFields();
    } catch (error: any) {
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
      onOk: async () => {
        try {
          await apiFetch(`/exams/${id}/delete/`, { method: 'DELETE' });
          toast.success("Test o'chirildi");
          fetchData();
        } catch (error) { toast.error("O'chirishda xatolik"); }
      },
    });
  };

  const columns = [
    {
      title: 'Test va Bo\'lim',
      key: 'test_info',
      render: (r: any) => (
        <div className="flex flex-col gap-1">
          <Text className="text-white font-semibold text-base">{r.title}</Text>
          <div className="flex items-center gap-2">
            <Tag color="blue" className="bg-blue-500/10 border-none text-[10px] uppercase font-bold">
              {r.department || 'Umumiy'}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Savollar',
      dataIndex: 'questions_count',
      align: 'center' as const,
      render: (c: any) => (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-slate-300">
            <FileTextOutlined className="text-blue-400" />
            <span className="font-medium">{c || 0} ta</span>
          </div>
        </div>
      )
    },
    {
      title: 'Davomiyligi',
      dataIndex: 'duration',
      render: (d: any) => (
        <div className="flex items-center gap-1.5 text-slate-300">
          <ClockCircleOutlined className="text-amber-400" />
          <span>{d} daqiqa</span>
        </div>
      )
    },
    {
      title: 'O\'tish balli',
      dataIndex: 'passing_score',
      render: (s: any) => (
        <div className="flex items-center gap-1.5">
          <CheckCircleOutlined className="text-emerald-500" />
          <span className="text-emerald-400 font-bold">{s || 35}%</span>
        </div>
      )
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 80,
      align: 'right' as const,
      render: (r: any) => (
        <Tooltip title="O'chirish">
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(r.id)}
            className="hover:bg-red-500/10 flex items-center justify-center"
          />
        </Tooltip>
      ),
    },
  ];

  if (view === 'add') {
    return (
      <div className="p-6 animate-in slide-in-from-right duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setView('list')}
            className="bg-slate-800 border-none text-white hover:bg-slate-700 h-10 w-10 rounded-xl"
          />
          <h2 className="text-2xl font-bold text-white m-0">Yangi test yaratish</h2>
        </div>

        <div className="max-w-2xl bg-[#0f172a] p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ passing_score: 35 }}>
            <Form.Item
              label={<span className="text-slate-400">Test nomi</span>}
              name="title"
              rules={[{ required: true, message: 'Nomini kiriting' }]}
            >
              <Input placeholder="Masalan: React JS Asoslari" className="h-12 bg-slate-900 border-slate-800 text-white rounded-xl" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item label={<span className="text-slate-400">Bo'lim</span>} name="department_id" rules={[{ required: true }]}>
                <Select placeholder="Tanlang" className="h-12 custom-select-dark">
                  {departments.map((d: any) => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item label={<span className="text-slate-400">Vaqt (daqiqa)</span>} name="duration" rules={[{ required: true }]}>
                <Input type="number" placeholder="45" className="h-12 bg-slate-900 border-slate-800 text-white rounded-xl" />
              </Form.Item>
            </div>

            <Form.Item label={<span className="text-slate-400">O'tish balli (%)</span>} name="passing_score">
              <Input type="number" placeholder="35" className="h-12 bg-slate-900 border-slate-800 text-white rounded-xl" />
            </Form.Item>

            <Form.Item label={<span className="text-slate-400">Excel fayl (.xlsx)</span>}>
              <Dragger
                beforeUpload={(file) => { setFileList([file]); return false; }}
                fileList={fileList}
                onRemove={() => setFileList([])}
                accept=".xlsx"
                className="bg-slate-900/50 border-slate-800 border-dashed rounded-2xl p-6"
              >
                <p className="ant-upload-drag-icon"><InboxOutlined className="text-blue-500" /></p>
                <p className="text-slate-300 font-medium">Faylni shu yerga tashlang yoki tanlang</p>
                <p className="text-slate-500 text-xs">Faqat .xlsx formatidagi fayllar qabul qilinadi</p>
              </Dragger>
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={loading} block className="h-14 bg-blue-600 border-none rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-blue-600/20">
              Saqlash va Yuklash
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white m-0">Testlar boshqaruvi</h1>
          <Text className="text-slate-500">Jami {exams.length} ta test mavjud</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setView('add')}
          className="h-12 px-6 bg-blue-600 border-none rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
        >
          Yangi test qo'shish
        </Button>
      </div>

      <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <Table
          columns={columns}
          dataSource={exams}
          loading={loading}
          rowKey="id"
          className="custom-dark-table"
          pagination={{ pageSize: 7, className: "p-4" }}
        />
      </div>
    </div>
  );
};

export default ExamsSection;