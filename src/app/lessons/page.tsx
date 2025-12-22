"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import DateTimeRangePicker from "@/components/DateTimePicker";
import { Lesson, Student, Group } from "@/types";

interface LessonWithRelations extends Lesson {
  student?: Student | null;
  group?: Group | null;
}

type ModalType = "create" | "edit" | "delete" | null;

export default function LessonsPage() {
  const [lessons, setLessons] = useState<LessonWithRelations[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    external: false,
    paid: false,
    price: "",
    type: "student" as "student" | "group",
    studentId: "",
    groupId: "",
  });

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

  const closeModal = () => {
    setModalType(null);
    setSelectedLesson(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      start: "",
      end: "",
      external: false,
      paid: false,
      price: "",
      type: "student",
      studentId: "",
      groupId: "",
    });
  };

  const openEditModal = (lesson: LessonWithRelations) => {
    setSelectedLesson(lesson);
    setFormData({
      title: lesson.title,
      start: new Date(lesson.start).toISOString().slice(0, 16),
      end: new Date(lesson.end).toISOString().slice(0, 16),
      external: lesson.external,
      paid: lesson.paid,
      price: lesson.price.toString(),
      type: lesson.type as "student" | "group",
      studentId: lesson.studentId || "",
      groupId: lesson.groupId || "",
    });
    setModalType("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      const url = selectedLesson
        ? `/api/lessons/${selectedLesson.id}`
        : "/api/lessons";
      const method = selectedLesson ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchData();
        closeModal();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedLesson) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
        closeModal();
      }
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Clases
        </h1>
        <button
          onClick={() => setModalType("create")}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Clase
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
          No hay clases registradas. ¡Crea la primera!
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
              {[...lessons]
                .sort((a, b) => {
                  const dateA = new Date(a.start).getTime();
                  const dateB = new Date(b.start).getTime();
                  return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                })
                .map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`${lesson.type === "student" ? "text-blue-600" : "text-green-600"}`}>
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setModalType("delete");
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalType === "create" || modalType === "edit"}
        onClose={closeModal}
        title={selectedLesson ? "Editar Clase" : "Nueva Clase"}
        closeOnClickOutside={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "student" | "group",
                  studentId: "",
                  groupId: "",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="student">Alumno</option>
              <option value="group">Grupo</option>
            </select>
          </div>

          {formData.type === "student" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alumno
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seleccionar alumno</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Grupo
              </label>
              <select
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seleccionar grupo</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Dejar vacío para usar el nombre del alumno/grupo"
            />
          </div>

          <DateTimeRangePicker
            startValue={formData.start}
            endValue={formData.end}
            onStartChange={(value) => setFormData((prev) => ({ ...prev, start: value }))}
            onEndChange={(value) => setFormData((prev) => ({ ...prev, end: value }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Precio (zł)
            </label>
            <input
              type="number"
              step="1"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.external}
                onChange={(e) => setFormData({ ...formData, external: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">De Aga</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.paid}
                onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Pagado</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {selectedLesson ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={modalType === "delete"}
        onClose={closeModal}
        title="Eliminar Clase"
      >
        <ConfirmDialog
          message={`¿Estás seguro de que deseas eliminar la clase "${selectedLesson?.title || (selectedLesson?.type === "student" ? selectedLesson?.student?.name : selectedLesson?.group?.name) || "Sin nombre"}"?`}
          onConfirm={handleDelete}
          onCancel={closeModal}
          isDeleting={isDeleting}
        />
      </Modal>
    </div>
  );
}
