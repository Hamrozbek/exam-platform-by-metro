import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Form, Space } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    ApartmentOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';


const DepartmentsSection: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [searchText, setSearchText] = useState('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);

    const [form] = Form.useForm();

    // 1. Ro'yxatni yuklash
    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await apiFetch('/departments/');
            setDepartments(data);
        } catch (error) {
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    // 2. Yangi bo'lim qo'shish
    const onFinish = async (values: { name: string, description: string }) => {
        try {
            setLoading(true);
            await apiFetch('/departments/', {
                method: 'POST',
                body: JSON.stringify({
                    name: values.name.trim(),
                    description: values.description || ""
                }),
            });
            toast.success("Bo'lim qo'shildi");
            setIsCreateModalOpen(false);
            form.resetFields();
            fetchDepartments();
        } catch (error) {
            toast.error("Qo'shishda xatolik");
        } finally {
            setLoading(false);
        }
    };

    // 3. Ma'lumotlarni ko'rish
    const handleView = async (id: number) => {
        try {
            setLoading(true);
            const data = await apiFetch(`/departments/${id}/`);
            setSelectedDept(data);
            setIsViewModalOpen(true);
        } catch (error) {
            toast.error("Ma'lumotni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: <span className="text-white font-bold text-lg">Bo'limni o'chirish</span>,
            icon: <ExclamationCircleOutlined className="text-red-500" />,
            content: <p className="text-slate-400 mt-2">Haqiqatan ham ushbu bo'limni o'chirmoqchimisiz?</p>,
            okText: "O'chirish",
            okType: 'danger',
            centered: true,
            rootClassName: "custom-confirm-modal",
            okButtonProps: {
                className: "bg-red-600 hover:bg-red-700 border-none h-10 px-6 rounded-lg font-medium"
            },
            cancelButtonProps: {
                className: "bg-slate-800 hover:bg-slate-700 border-none text-slate-300 h-10 px-6 rounded-lg"
            },
            onOk: async () => {
                try {
                    await apiFetch(`/departments/${id}/`, { method: 'DELETE' });

                    toast.success("Bo'lim muvaffaqiyatli o'chirildi");
                    fetchDepartments(); // Ro'yxatni yangilash
                } catch (error) {
                    console.error("Xatolik:", error);
                    toast.error("O'chirishda xatolik yuz berdi");
                }
            },
        });
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'id',
            width: 70,
            render: (_: any, __: any, i: number) => <span className="text-slate-500">{i + 1}</span>
        },
        {
            title: 'Bo\'lim nomi',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <ApartmentOutlined className="text-blue-500" />
                    <span className="text-slate-200 font-medium">{text}</span>
                </Space>
            )
        },
        {
            title: 'Tavsif',
            dataIndex: 'description',
            ellipsis: true,
            render: (text: string) => <span className="text-slate-500 text-sm">{text || '—'}</span>
        },
        {
            title: 'Amallar',
            key: 'actions',
            width: 120,
            render: (record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined className="text-blue-400" />}
                        onClick={() => handleView(record.id)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white m-0">Struktura</h1>
                    <p className="text-slate-500 text-sm">Barcha bo'limlar ro'yxati</p>
                </div>

                <Space>
                    <Input
                        placeholder="Qidirish..."
                        prefix={<SearchOutlined className="text-slate-500" />}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="h-11 bg-slate-900 border-slate-800 text-white rounded-xl w-64"
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-11 bg-blue-600 border-none rounded-xl px-6"
                    >
                        Bo'lim qo'shish
                    </Button>
                </Space>
            </div>

            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <Table
                    columns={columns}
                    dataSource={departments.filter((d: any) => d.name.toLowerCase().includes(searchText.toLowerCase()))}
                    loading={loading}
                    rowKey="id"
                    className="custom-dark-table"
                />
            </div>

            {/* --- VIEW MODAL --- */}
            <Modal
                title={null}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={null}
                centered
                width={500}
                // Styles o'rniga faqat className ishlatamiz
                className="dark-modal-container"
                closeIcon={<span className="text-slate-500 hover:text-white">✕</span>}
            >
                {selectedDept && (
                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="h-20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-6 border-b border-slate-800">
                            <div className="flex justify-between items-center">
                                <Space>
                                    <ApartmentOutlined className="text-2xl text-blue-500" />
                                    <span className="text-white font-bold text-xl">Bo'lim ma'lumotlari</span>
                                </Space>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Nomi</p>
                                <h3 className="text-white text-2xl font-bold m-0">{selectedDept.name}</h3>
                            </div>

                            <div className="space-y-2">
                                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Tavsif</p>
                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                                    <p className="text-slate-300 m-0 leading-relaxed italic">
                                        {selectedDept.description || "Tavsif kiritilmagan."}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold">Yaratilgan sana</p>
                                    <p className="text-slate-300 text-sm m-0">
                                        {new Date(selectedDept.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <CalendarOutlined className="text-blue-500 text-xl" />
                            </div>

                            <Button
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-full h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-xl font-bold transition-all"
                            >
                                Yopish
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- CREATE MODAL (Yangi qo'shish) --- */}
            <Modal
                title={null} // Default titleni yopamiz, o'zimiz custom qilamiz
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                centered
                width={450}
                className="dark-modal-container" // Bu klass index.css dagi stilni ulaydi
                closeIcon={<span className="text-slate-500 hover:text-white mt-2 mr-2">✕</span>}
            >
                {/* Konteyner div - hamma stil shu yerda */}
                <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">

                    {/* Header qismi */}
                    <div className="p-6 border-b border-slate-800/50 bg-slate-900/20">
                        <h3 className="text-white font-bold text-xl m-0 flex items-center gap-2">
                            <PlusOutlined className="text-blue-500 text-lg" />
                            Yangi Bo'lim
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">Kompaniya strukturasiga yangi bo'lim qo'shish</p>
                    </div>

                    {/* Form qismi */}
                    <div className="p-6">
                        <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-4">
                            <Form.Item
                                label={<span className="text-slate-400 font-medium">Bo'lim nomi</span>}
                                name="name"
                                rules={[{ required: true, message: 'Nomni kiriting' }]}
                            >
                                <Input
                                    placeholder="Masalan: HR, IT yoki Logistika"
                                    className="h-12 bg-slate-950 border-slate-800 text-white rounded-xl focus:border-blue-500 hover:border-slate-700 transition-all"
                                />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-slate-400 font-medium">Tavsif (Ixtiyoriy)</span>}
                                name="description"
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="Bo'lim vazifalari haqida qisqacha..."
                                    className="bg-slate-950 border-slate-800 text-white rounded-xl hover:border-slate-700 transition-all p-3"
                                />
                            </Form.Item>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 border-none text-slate-300 rounded-xl font-medium"
                                >
                                    Bekor qilish
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="flex-[2] h-12 bg-blue-600 hover:bg-blue-500 border-none rounded-xl font-bold shadow-lg shadow-blue-600/20"
                                >
                                    Saqlash
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DepartmentsSection;