"use client";

import { useState, useEffect } from "react";
import { Lesson, Student, Group } from "@/types";

interface CalendarLesson extends Lesson {
  student?: Student | null;
  group?: Group | null;
}

export default function CalendarPage() {
  const [lessons, setLessons] = useState<CalendarLesson[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch("/api/lessons");
      if (res.ok) {
        const data = await res.json();
        setLessons(data);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsLoading(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Calendario
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="min-h-24 p-2 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayLessons = getLessonsForDay(day);

            return (
              <div
                key={day}
                className={`min-h-24 p-2 border border-gray-100 dark:border-gray-700 ${
                  isToday(day)
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday(day)
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayLessons.slice(0, 3).map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`text-xs p-1 rounded truncate ${
                        lesson.type === "student"
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                          : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
                      } ${lesson.paid ? "opacity-60" : ""}`}
                      title={`${lesson.title} - ${formatTime(lesson.start)}`}
                    >
                      {formatTime(lesson.start)} {lesson.title}
                    </div>
                  ))}
                  {dayLessons.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayLessons.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/50 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Alumno</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/50 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Grupo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded opacity-60"></div>
          <span className="text-gray-600 dark:text-gray-400">Pagado</span>
        </div>
      </div>
    </div>
  );
}
