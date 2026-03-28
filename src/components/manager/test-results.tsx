import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Typography, Tooltip, Space, Avatar, Tag } from 'antd';
import {
  SearchOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import { apiFetch } from '../../utils/api';
import { toast } from 'sonner';

const { Text } = Typography;

const ManagerResultsSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const pageSize = 10;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/results/all/');

      console.log("🔥 TEST NATIJALARI:", data);

      if (data && data.results) {
        setResults(data.results || []);
      } else if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch {
      toast.error("Natijalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleViewResult = async (record: any) => {
    try {
      setLoading(true);
      const data = await apiFetch(`/results/all/${record.id}/`);
      setSelectedResult(data);
      setIsViewModalOpen(true);
    } catch {
      toast.error("Natija detallarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Qidiruv filtri
  const filtered = results.filter((item: any) => {
    const fullName = (item?.user?.full_name || '').toLowerCase();
    const examTitle = (item?.exam?.title || '').toLowerCase();
    const deptInfo = (item?.exam?.department || '').toLowerCase();
    return fullName.includes(searchText.toLowerCase()) ||
      (item?.user?.username || '').toLowerCase().includes(searchText.toLowerCase()) ||
      examTitle.includes(searchText.toLowerCase()) ||
      deptInfo.includes(searchText.toLowerCase());
  });

  // --- MOBILE CARD ---
  const MobileCard = ({ record }: { record: any }) => {
    const isPassed = record?.is_passed;
    const examTitle = record?.exam?.title || '_';
    const dept = record?.exam?.department || '_';
    const percentage = record?.total_questions ? Math.round((record.correct_answers / record.total_questions) * 100) : 0;

    return (
      <div className="bg-[#1e293b]/40 border border-slate-800/60 rounded-2xl p-4 mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <Avatar className="bg-blue-500/10 text-blue-500 shrink-0" icon={<UserOutlined />} />
            <div>
              <p className="text-white font-semibold text-sm m-0 truncate">
                {record?.user?.full_name || '_'}
              </p>
              <p className="text-slate-500 text-xs m-0">@{record?.user?.username || '_'} ({dept})</p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined className="text-blue-400" />}
              onClick={() => handleViewResult(record)}
              className="hover:bg-blue-500/10 rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
            <FileTextOutlined className="text-blue-400" />
            <span className="truncate">{examTitle}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
              <CalendarOutlined />
              <span>{record?.start_time ? new Date(record.start_time).toLocaleString() : '_'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {isPassed ? <CheckCircleOutlined className="text-emerald-500" /> : <CloseCircleOutlined className="text-red-500" />}
              <span className={`font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- DESKTOP COLUMNS ---
  const columns = [
    {
      title: '#',
      width: 50,
      render: (_: any, __: any, index: number) => <span className="text-slate-500">{(currentPage - 1) * pageSize + index + 1}</span>,
    },
    {
      title: 'Xodim',
      key: 'employee',
      render: (r: any) => (
        <Space>
          <Avatar className="bg-blue-500/10 text-blue-500" icon={<UserOutlined />} />
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">{r?.user?.full_name || '_'}</span>
            <span className="text-slate-500 text-[11px]">@{r?.user?.username || '_'}</span>
          </div>
        </Space>
      ),
    },
    {
      title: "Test Nomi & Bo'limi",
      key: 'exam_info',
      render: (r: any) => {
        const examTitle = r?.exam?.title || '_';
        const dept = r?.exam?.department || '_';
        return (
          <div className="flex flex-col gap-1">
            <Text className="text-slate-200 font-semibold text-sm truncate max-w-[200px]">{examTitle}</Text>
            <span className="text-slate-500 text-[10px] font-mono flex items-center gap-1">
              <ApartmentOutlined /> {dept}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Topshirgan Sana',
      key: 'date',
      render: (r: any) => (
        <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
          <CalendarOutlined /> {r?.start_time ? new Date(r.start_time).toLocaleString() : '_'}
        </span>
      ),
    },
    {
      title: 'To\'g\'ri javoblar / Jami',
      key: 'scores',
      responsive: ['md'] as any,
      render: (r: any) => {
        const percentage = r?.total_questions ? Math.round((r.correct_answers / r.total_questions) * 100) : 0;
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">{r?.correct_answers || 0}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-500">{r?.total_questions || 0}</span>
            <span className={`ml-2 font-bold text-sm ${r?.is_passed ? 'text-emerald-400' : 'text-red-400'}`}>
              ({percentage}%)
            </span>
          </div>
        );
      },
    },
    {
      title: 'Holati',
      key: 'status',
      responsive: ['sm'] as any,
      render: (r: any) => {
        const isPassed = r.is_passed;
        return (
          <Tag color={isPassed ? 'success' : 'error'} className="border-none px-3 font-bold uppercase tracking-wider text-[10px] m-0">
            {isPassed ? 'O\'tdi' : 'Yiqildi'}
          </Tag>
        );
      },
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 80,
      align: 'right' as const,
      render: (r: any) => (
        <Tooltip title="Natijani ko'rish">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewResult(r)}
            className="text-blue-400 hover:bg-blue-500/10"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-6 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-8 bg-slate-900/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/50">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white m-0">Test Natijalari</h1>
          <Text className="text-slate-500 text-sm">Bo'limingizga tegishli barcha topshirilgan testlar</Text>
        </div>
        <Input
          placeholder="Xodim yoki test nomi orqali qidirish..."
          prefix={<SearchOutlined className="text-slate-500" />}
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-80 h-11 sm:h-12 bg-[#0f172a] border-slate-700 text-white rounded-xl focus:border-blue-500 self-start sm:self-auto"
        />
      </div>

      {/* Jadval / Mobile kartalar */}
      {isMobile ? (
        <div>
          {filtered.length === 0 && !loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">Natijalar topilmadi</div>
          ) : (
            filtered
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((res: any, idx: number) => <MobileCard key={idx} record={res} />)
          )}
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="id"
            className="custom-dark-table"
            pagination={{
              pageSize,
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              className: 'p-4 m-0 border-t border-slate-800/50',
              showSizeChanger: false
            }}
            scroll={{ x: 600 }}
          />
        </div>
      )}

      {/* VIEW RESULT MODAL */}
      <Modal
        title={null}
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
        width="95%"
        style={{ maxWidth: 500 }}
        centered
        closeIcon={null}
        modalRender={(modal) => (
          <div className="bg-[#0b1120] border border-slate-800 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl">
            {modal}
          </div>
        )}
      >
        {selectedResult && (
          <div className="p-5 sm:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Avatar
                  size={56}
                  className="bg-blue-600 text-white shrink-0 border-2 border-slate-700 shadow-lg"
                  icon={<UserOutlined />}
                />
                <div className="min-w-0">
                  <h2 className="text-white text-lg sm:text-xl font-bold m-0 truncate">
                    {selectedResult?.user?.full_name || '_'}
                  </h2>
                  <p className="text-blue-400 text-xs font-mono mt-1 mb-0 bg-blue-500/10 px-2 py-0.5 rounded w-fit">
                    @{selectedResult?.user?.username || '_'} ({selectedResult?.exam?.department || '_'})
                  </p>
                </div>
              </div>
              <Button
                type="text"
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 rounded-full shrink-0 flex items-center justify-center w-8 h-8 p-0"
              >✕</Button>
            </div>

            {/* Test Details Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 shrink-0">
                  <TrophyOutlined className="text-purple-400 text-xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1 m-0">Topshirilgan Test</p>
                  <p className="text-white text-sm sm:text-base font-bold m-0 truncate">
                    {selectedResult?.exam?.title || '_'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider m-0 mb-1">Jami savollar</p>
                  <p className="text-slate-300 font-bold m-0">{selectedResult?.total_questions || 0} ta</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider m-0 mb-1">Topshirilgan vaqt</p>
                  <p className="text-slate-400 font-mono text-[10px] m-0 flex items-center gap-1 mt-1">
                    <ClockCircleOutlined /> {selectedResult?.start_time ? new Date(selectedResult.start_time).toLocaleString() : '_'}
                  </p>
                </div>
              </div>
            </div>

            {/* Natija */}
            {(() => {
              const isPassed = selectedResult?.is_passed;
              const percentage = selectedResult?.total_questions ? Math.round((selectedResult.correct_answers / selectedResult.total_questions) * 100) : 0;
              return (
                <div className={`p-5 rounded-2xl border flex items-center justify-between shadow-inner ${isPassed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center gap-3">
                    {isPassed ? <CheckCircleOutlined className="text-emerald-400 text-3xl" /> : <CloseCircleOutlined className="text-red-400 text-3xl" />}
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider m-0 ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                        Yakuniy Holat
                      </p>
                      <p className={`text-base font-bold uppercase m-0 ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPassed ? "Muvaffaqiyatli O'tdi" : 'Testdan Yiqildi'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-3xl font-black ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {percentage}%
                  </div>
                </div>
              );
            })()}

            {/* BATAFSIL TAHLIL (Q&A BREAKDOWN) */}
            {selectedResult?.answers && selectedResult.answers.length > 0 && (
              <div className="mt-8">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FileTextOutlined className="text-blue-500" /> Batafsil Tahlil
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedResult.answers.map((ans: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${ans.is_correct ? 'bg-green-500/5 border-green-500/20' : ans.selected_option_text ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/30 border-slate-700/50'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${ans.is_correct ? 'bg-green-500 text-white' : ans.selected_option_text ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-xs font-medium leading-relaxed mb-2">{ans.question_text}</p>
                          <div className="space-y-1.5">
                            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] ${ans.is_correct ? 'bg-green-500/10 text-green-300' : ans.selected_option_text ? 'bg-red-500/10 text-red-300' : 'bg-slate-800/50 text-slate-500 italic'}`}>
                              {ans.is_correct ? <CheckCircleOutlined /> : ans.selected_option_text ? <CloseCircleOutlined /> : <MinusCircleOutlined />}
                              <span>{ans.selected_option_text || "To'ldirilmagan (o'tkazib yuborilgan)"}</span>
                            </div>
                            {!ans.is_correct && ans.correct_option_text && (
                              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] bg-green-500/10 text-green-400 font-medium">
                                <CheckCircleOutlined />
                                <span>To'g'ri javob: {ans.correct_option_text}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BARCHA TESTLAR RO'YXATI (USER HISTORY) */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 m-0">
                  <CalendarOutlined className="text-blue-500" /> Topshirilgan Barcha Testlar
                </h3>
                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                   Jami: {results.filter(r => r?.user?.username === selectedResult?.user?.username).length} ta
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {results
                  .filter(r => r?.user?.username === selectedResult?.user?.username)
                  .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                  .map((attempt, idx) => {
                    const isSucc = attempt?.is_passed;
                    const perc = attempt?.total_questions ? Math.round((attempt.correct_answers / attempt.total_questions) * 100) : 0;
                    return (
                      <div key={idx} className="bg-slate-900/40 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between gap-4 group hover:border-slate-700 transition-all">
                        <div className="min-w-0">
                          <h4 className="text-slate-200 font-bold text-sm m-0 truncate group-hover:text-blue-400 transition-colors">
                            {attempt?.exam?.title || '_'}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-slate-500 text-[10px] font-mono">
                              {attempt?.start_time ? new Date(attempt.start_time).toLocaleDateString() : '_'}
                            </span>
                            <span className="text-slate-600 text-[10px]">
                              {attempt.correct_answers} to'g'ri / {attempt.wrong_answers} xato
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                           <div className="text-right">
                              <p className={`text-sm font-black m-0 ${isSucc ? 'text-emerald-400' : 'text-red-400'}`}>
                                {perc}%
                              </p>
                              <span className={`text-[9px] uppercase font-bold ${isSucc ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                                {isSucc ? "O'tdi" : "Yiqildi"}
                              </span>
                           </div>
                           {isSucc ? <CheckCircleOutlined className="text-emerald-500 text-lg" /> : <CloseCircleOutlined className="text-red-500 text-lg" />}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            <Button
              block
              onClick={() => setIsViewModalOpen(false)}
              className="mt-8 h-12 bg-slate-800 hover:bg-slate-700 border-none text-white rounded-2xl font-bold transition-all shadow-md"
            >
              Yopish
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerResultsSection;