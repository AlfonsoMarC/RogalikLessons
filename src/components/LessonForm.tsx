"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import DateTimeRangePicker from "@/components/DateTimePicker";
import { Lesson, Student, Group } from "@/types";

export interface LessonWithRelations extends Lesson {
  student?: Student | null;
  group?: Group | null;
}

interface LessonFormProps {
  isOpen: boolean;
  onClose: () => void;
  lesson?: LessonWithRelations | null;
  students: Student[];
  groups: Group[];
  onSave: () => void;
}

interface LessonFormData {
  title: string;
  start: string;
  end: string;
  external: boolean;
  paid: boolean;
  price: string;
  type: "student" | "group";
  studentId: string;
  groupId: string;
}

const initialFormData: LessonFormData = {
  title: "",
  start: "",
  end: "",
  external: false,
  paid: false,
  price: "",
  type: "student",
  studentId: "",
  groupId: "",
};

export default function LessonForm({
  isOpen,
  onClose,
  lesson,
  students,
  groups,
  onSave,
}: LessonFormProps) {
  const [formData, setFormData] = useState<LessonFormData>(initialFormData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (lesson) {
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
    } else {
      setFormData(initialFormData);
    }
    setShowDeleteConfirm(false);
  }, [lesson, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    try {
      const url = lesson ? `/api/lessons/${lesson.id}` : "/api/lessons";
      const method = lesson ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
    }
  };

  const handleDelete = async () => {
    if (!lesson) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Clase">
        <ConfirmDialog
          message={`¿Estás seguro de que deseas eliminar esta clase?`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          isDeleting={isDeleting}
        />
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson ? "Editar Clase" : "Nueva Clase"}
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

        <div className="flex justify-between pt-4">
          <div>
            {lesson && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {lesson ? "Actualizar" : "Crear"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
