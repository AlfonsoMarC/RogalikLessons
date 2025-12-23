"use client";

import { useState, useEffect } from "react";
import LessonForm, { LessonWithRelations } from "@/components/LessonForm";
import Modal from "@/components/Modal";
import { Student, Group } from "@/types";

export default function CalendarPage() {
  const [lessons, setLessons] = useState<LessonWithRelations[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonWithRelations | null>(null);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [dayModal, setDayModal] = useState<{
    open: boolean;
    date: Date | null;
    lessons: LessonWithRelations[];
  }>({ open: false, date: null, lessons: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, studentsRes, groupsRes] = await Promise.all([
        fetch("/api/lessons"),
        fetch("/api/students"),
        fetch("/api/groups"),
      ]);

      if (lessonsRes.ok && studentsRes.ok && groupsRes.ok) {
        const lessonsData = await lessonsRes.json();
        const studentsData = await studentsRes.json();
        const groupsData = await groupsRes.json();
        setLessons(lessonsData);
        setStudents(studentsData);
        setGroups(groupsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = (date?: Date) => {
    setSelectedLesson(null);
    setInitialDate(date || null);
    setIsFormOpen(true);
  };

  const openEditModal = (lesson: LessonWithRelations) => {
    setSelectedLesson(lesson);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedLesson(null);
    setInitialDate(null);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay: startingDay === 0 ? 6 : startingDay - 1 };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const getLessonsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.start);
      return (
        lessonDate.getDate() === day &&
        lessonDate.getMonth() === currentDate.getMonth() &&
        lessonDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const colorClassForLesson = (lesson: LessonWithRelations) => {
    const isPast = new Date(lesson.end) < new Date();
    if (lesson.external) return "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200";
    if (lesson.paid) return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200";
    if (isPast) return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200";
    return "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300";
  };

  const colorDotClassForLesson = (lesson: LessonWithRelations) => {
    const isPast = new Date(lesson.end) < new Date();
    if (lesson.external)
      return "bg-purple-100 dark:bg-purple-900/50 ring-2 ring-offset-1 ring-white dark:ring-gray-900";
    if (lesson.paid)
      return "bg-green-100 dark:bg-green-900/50 ring-2 ring-offset-1 ring-white dark:ring-gray-900";
    if (isPast)
      return "bg-red-100 dark:bg-red-900/50 ring-2 ring-offset-1 ring-white dark:ring-gray-900";
    return "bg-gray-100 dark:bg-gray-600 ring-2 ring-offset-1 ring-white dark:ring-gray-900";
  };

  const openDayModal = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const lessonsForDay = getLessonsForDay(day).sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    setDayModal({ open: true, date, lessons: lessonsForDay });
  };

  const closeDayModal = () => setDayModal({ open: false, date: null, lessons: [] });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-3 bg-blue-600 text-white">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: startingDay }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="h-32 sm:h-40 p-1.5 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayLessons = getLessonsForDay(day);

            return (
              <button
                type="button"
                onClick={() => openDayModal(day)}
                key={day}
                className={`h-32 sm:h-40 p-1.5 border border-gray-100 dark:border-gray-700 text-left w-full flex flex-col overflow-hidden ${
                  isToday(day)
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <div
                  className={`text-xs font-medium self-start mb-0.5 ${
                    isToday(day)
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex flex-wrap gap-1 sm:hidden">
                    {dayLessons.slice(0, 4).map((lesson) => (
                      <span
                        key={lesson.id}
                        className={`w-2.5 h-2.5 rounded-full inline-block ${colorDotClassForLesson(lesson)}`}
                        title={formatTime(lesson.start)}
                      ></span>
                    ))}
                    {dayLessons.length > 4 && (
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">+{dayLessons.length - 4}</span>
                    )}
                  </div>

                  <div className="hidden sm:block space-y-0.5">
                    {dayLessons.slice(0, 6).map((lesson) => {
                      const lessonName = lesson.type === "student" && lesson.student
                        ? lesson.student.name
                        : lesson.type === "group" && lesson.group
                          ? lesson.group.name
                          : lesson.title || "Sin título";

                      return (
                        <span
                          key={lesson.id}
                          className={`block w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate ${colorClassForLesson(lesson)}`}
                          title={`${lessonName} - ${formatTime(lesson.start)}`}
                        >
                          {formatTime(lesson.start)} {lessonName}
                        </span>
                      );
                    })}
                    {dayLessons.length > 6 && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                        +{dayLessons.length - 6} más
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/50 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Pagado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Pendiente de pago</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/50 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Pago atrasado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/50 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">De aga</span>
        </div>
      </div>

      <LessonForm
        isOpen={isFormOpen}
        onClose={closeModal}
        lesson={selectedLesson}
        initialDate={initialDate}
        students={students}
        groups={groups}
        onSave={fetchData}
      />

      <Modal
        isOpen={dayModal.open}
        onClose={closeDayModal}
        title={dayModal.date ? formatDate(dayModal.date) : "Clases"}
      >
        <div className="space-y-3">
          {dayModal.lessons.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No hay clases este día.</div>
          ) : (
            <div className="space-y-2">
            {dayModal.lessons.map((lesson) => {
              const lessonName = lesson.type === "student" && lesson.student
                ? lesson.student.name
                : lesson.type === "group" && lesson.group
                  ? lesson.group.name
                  : lesson.title || "Sin título";

              return (
                <button
                  key={lesson.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${colorClassForLesson(lesson)}`}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setIsFormOpen(true);
                    closeDayModal();
                  }}
                >
                  <span className="font-semibold">{formatTime(lesson.start)}</span>
                  <span className="truncate">{lessonName}</span>
                </button>
              );
            })}
            </div>
          )}
          
          <button
            onClick={() => {
              openCreateModal(dayModal.date || undefined);
              closeDayModal();
            }}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Nueva Clase
          </button>
        </div>
      </Modal>
    </div>
  );
}
