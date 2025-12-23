"use client";

import { useState, useEffect } from "react";
import LessonForm, { LessonWithRelations } from "@/components/LessonForm";
import { Student, Group } from "@/types";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonWithRelations[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonWithRelations | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const openCreateModal = () => {
    setSelectedLesson(null);
    setIsFormOpen(true);
  };

  const openEditModal = (lesson: LessonWithRelations) => {
    setSelectedLesson(lesson);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsFormOpen(false);
    setSelectedLesson(null);
  };

  const sortedLessons = [...lessons].sort((a, b) => {
    const dateA = new Date(a.start).getTime();
    const dateB = new Date(b.start).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const togglePaid = async (lesson: LessonWithRelations) => {
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid: !lesson.paid }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clases</h1>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Clase
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
          No hay clases registradas. ¡Crea la primera!
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-3">
            {sortedLessons.map((lesson) => (
              <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={lesson.type === "student" ? "text-blue-600" : "text-green-600"}>
                    {lesson.type === "student" ? "👤" : "👥"}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {lesson.title || (lesson.type === "student"
                        ? lesson.student?.name || "Sin asignar"
                        : lesson.group?.name || "Sin asignar")}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(lesson.start)}</span>
                  </div>
                  {lesson.external && (
                    <span className="ml-auto px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded">
                      De Aga
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-200">
                  <span className="font-medium">{formatCurrency(lesson.price)}</span>
                  <button
                    onClick={() => togglePaid(lesson)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      lesson.paid
                        ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900"
                        : new Date(lesson.end) < new Date()
                          ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900"
                          : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                    }`}
                  >
                    {lesson.paid ? "✓ Pagado" : "Pendiente"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300"
                  >
                    Ordenar {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                  <button
                    onClick={() => openEditModal(lesson)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Clase
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 select-none"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      <div className="flex items-center gap-1">
                        Fecha/Hora
                        <span className="text-gray-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedLessons.map((lesson) => (
                    <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={lesson.type === "student" ? "text-blue-600" : "text-green-600"}>
                            {lesson.type === "student" ? "👤" : "👥"}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {lesson.title || (lesson.type === "student"
                              ? lesson.student?.name || "Sin asignar"
                              : lesson.group?.name || "Sin asignar")}
                          </span>
                          {lesson.external && (
                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded">
                              De Aga
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDateTime(lesson.start)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(lesson.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePaid(lesson)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            lesson.paid
                              ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900"
                              : new Date(lesson.end) < new Date()
                                ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900"
                                : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                          }`}
                        >
                          {lesson.paid ? "✓ Pagado" : "Pendiente"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(lesson)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <LessonForm
        isOpen={isFormOpen}
        onClose={closeModal}
        lesson={selectedLesson}
        students={students}
        groups={groups}
        onSave={fetchData}
      />
    </div>
  );
}
