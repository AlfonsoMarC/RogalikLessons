export interface Student {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lessons?: Lesson[];
}

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  start: Date;
  end: Date;
  external: boolean;
  paid: boolean;
  price: number;
  type: "student" | "group";
  studentId?: string | null;
  groupId?: string | null;
  student?: Student | null;
  group?: Group | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentWithPendingPayment extends Student {
  pendingPayment: number;
}

export interface GroupWithPendingPayment extends Group {
  pendingPayment: number;
}
