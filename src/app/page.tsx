"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import StudentForm from "@/components/StudentForm";
import GroupForm from "@/components/GroupForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import { StudentWithPendingPayment, GroupWithPendingPayment, Lesson } from "@/types";

type ModalType = "createStudent" | "editStudent" | "deleteStudent" | "createGroup" | "editGroup" | "deleteGroup" | null;

export default function StudentsAndGroupsPage() {
  const [students, setStudents] = useState<StudentWithPendingPayment[]>([]);
  const [groups, setGroups] = useState<GroupWithPendingPayment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithPendingPayment | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithPendingPayment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [summaryDate, setSummaryDate] = useState(new Date());

  const fetchData = async () => {
    try {
      const [studentsRes, groupsRes, lessonsRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/groups"),
        fetch("/api/lessons"),
      ]);

      if (studentsRes.ok && groupsRes.ok && lessonsRes.ok) {
        const studentsData = await studentsRes.json();
        const groupsData = await groupsRes.json();
        const lessonsData = await lessonsRes.json();
        setStudents(studentsData);
        setGroups(groupsData);
        setLessons(lessonsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeModal = () => {
    setModalType(null);
    setSelectedStudent(null);
    setSelectedGroup(null);
  };

  const handleCreateStudent = async (name: string) => {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      await fetchData();
      closeModal();
    }
  };

  const handleEditStudent = async (name: string) => {
    if (!selectedStudent) return;

    const res = await fetch(`/api/students/${selectedStudent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      await fetchData();
      closeModal();
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
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

  const handleCreateGroup = async (name: string) => {
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      await fetchData();
      closeModal();
    }
  };

  const handleEditGroup = async (name: string) => {
    if (!selectedGroup) return;

    const res = await fetch(`/api/groups/${selectedGroup.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      await fetchData();
      closeModal();
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/groups/${selectedGroup.id}`, {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const prevMonth = () => {
    setSummaryDate(new Date(summaryDate.getFullYear(), summaryDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSummaryDate(new Date(summaryDate.getFullYear(), summaryDate.getMonth() + 1, 1));
  };

  // Calculate monthly summary
  const getMonthlyLessons = () => {
    return lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.start);
      return (
        lessonDate.getMonth() === summaryDate.getMonth() &&
        lessonDate.getFullYear() === summaryDate.getFullYear()
      );
    });
  };

  const monthlyLessons = getMonthlyLessons();
  const now = new Date();

  // Pagos pendientes propios (clases realizadas, no pagadas, no externas)
  const pendingOwn = monthlyLessons
    .filter((l) => !l.paid && !l.external && new Date(l.end) <= now)
    .reduce((sum, l) => sum + l.price, 0);

  // Ingresos cobrados propios (clases pagadas, no externas)
  const incomeOwn = monthlyLessons
    .filter((l) => l.paid && !l.external)
    .reduce((sum, l) => sum + l.price, 0);

  // Pagos pendientes de Aga (clases realizadas, no pagadas, externas)
  const pendingAga = monthlyLessons
    .filter((l) => !l.paid && l.external && new Date(l.end) <= now)
    .reduce((sum, l) => sum + l.price, 0);

  // Ingresos cobrados de Aga (clases pagadas, externas)
  const incomeAga = monthlyLessons
    .filter((l) => l.paid && l.external)
    .reduce((sum, l) => sum + l.price, 0);

  // Totales
  const totalIncome = incomeOwn + incomeAga;
  const totalPending = pendingOwn + pendingAga;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mis Alumnos y Grupos
        </h1>

      {/* Students Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span>👤</span> Alumnos
          </h2>
          <button
            onClick={() => setModalType("createStudent")}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Nuevo Alumno
          </button>
        </div>

        {students.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
            No hay alumnos registrados. ¡Crea el primero!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        student.pendingPayment > 0
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {student.pendingPayment > 0
                        ? `Pendiente: ${formatCurrency(student.pendingPayment)}`
                        : "Sin pagos pendientes"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setModalType("editStudent");
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setModalType("deleteStudent");
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Groups Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span>👥</span> Grupos
          </h2>
          <button
            onClick={() => setModalType("createGroup")}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            + Nuevo Grupo
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
            No hay grupos registrados. ¡Crea el primero!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4 border-green-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        group.pendingPayment > 0
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {group.pendingPayment > 0
                        ? `Pendiente: \${formatCurrency(group.pendingPayment)}`
                        : "Sin pagos pendientes"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setModalType("editGroup");
                      }}
                      className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGroup(group);
                        setModalType("deleteGroup");
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>

      {/* Aside - Monthly Summary */}
      <aside className="lg:w-80 shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-4">
          {/* Month Selector */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {monthNames[summaryDate.getMonth()]} {summaryDate.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Summary Table */}
          <div className="space-y-3">
            {/* Propios */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pendiente propio</span>
              <span className={`font-medium ${pendingOwn > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                {formatCurrency(pendingOwn)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cobrado propio</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(incomeOwn)}
              </span>
            </div>
            {/* De Aga */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pendiente Aga</span>
              <span className={`font-medium ${pendingAga > 0 ? "text-purple-600 dark:text-purple-400" : "text-gray-900 dark:text-white"}`}>
                {formatCurrency(pendingAga)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cobrado Aga</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {formatCurrency(incomeAga)}
              </span>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total cobrado</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total pendiente</span>
              <span className={`font-bold ${totalPending > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                {formatCurrency(totalPending)}
              </span>
            </div>
          </div>

          {/* Logo image below summary, full-bleed inside card (no visible borders) */}
          <div className="mt-4 hidden lg:block -mx-4 -mb-4">
            <div className="relative w-full aspect-square overflow-hidden rounded-b-lg">
              <Image
                src="/rogalik.png"
                alt="Rogalik logo"
                fill
                sizes="(min-width: 1024px) 320px"
                className="object-cover select-none pointer-events-none"
                priority
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <Modal
        isOpen={modalType === "createStudent"}
        onClose={closeModal}
        title="Nuevo Alumno"
      >
        <StudentForm onSubmit={handleCreateStudent} onCancel={closeModal} />
      </Modal>

      <Modal
        isOpen={modalType === "editStudent"}
        onClose={closeModal}
        title="Editar Alumno"
      >
        <StudentForm
          student={selectedStudent}
          onSubmit={handleEditStudent}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modalType === "deleteStudent"}
        onClose={closeModal}
        title="Eliminar Alumno"
      >
        <ConfirmDialog
          message={`¿Estás seguro de que deseas eliminar a "${selectedStudent?.name}"? Esta acción también eliminará todas las clases asociadas.`}
          onConfirm={handleDeleteStudent}
          onCancel={closeModal}
          isDeleting={isDeleting}
        />
      </Modal>

      <Modal
        isOpen={modalType === "createGroup"}
        onClose={closeModal}
        title="Nuevo Grupo"
      >
        <GroupForm onSubmit={handleCreateGroup} onCancel={closeModal} />
      </Modal>

      <Modal
        isOpen={modalType === "editGroup"}
        onClose={closeModal}
        title="Editar Grupo"
      >
        <GroupForm
          group={selectedGroup}
          onSubmit={handleEditGroup}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={modalType === "deleteGroup"}
        onClose={closeModal}
        title="Eliminar Grupo"
      >
        <ConfirmDialog
          message={`¿Estás seguro de que deseas eliminar el grupo "\${selectedGroup?.name}"? Esta acción también eliminará todas las clases asociadas.`}
          onConfirm={handleDeleteGroup}
          onCancel={closeModal}
          isDeleting={isDeleting}
        />
      </Modal>
    </div>
  );
}
