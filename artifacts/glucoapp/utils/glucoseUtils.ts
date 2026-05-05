import type { GlucoseReading, GlucoseStatus } from "@/types";

export function getGlucoseStatus(value: number): GlucoseStatus {
  if (value < 70) return "low";
  if (value <= 140) return "normal";
  if (value <= 180) return "elevated";
  return "high";
}

export function getStatusLabel(status: GlucoseStatus): string {
  switch (status) {
    case "low":
      return "Baixo";
    case "normal":
      return "Normal";
    case "elevated":
      return "Elevado";
    case "high":
      return "Alto";
  }
}

export function getContextLabel(context: GlucoseReading["context"]): string {
  switch (context) {
    case "fasting":
      return "Jejum";
    case "before_meal":
      return "Antes da refeição";
    case "after_meal":
      return "Após refeição";
    case "sleep":
      return "Dormir";
    case "other":
      return "Outro";
  }
}

export function getMascotMood(
  status: GlucoseStatus
): "happy" | "neutral" | "worried" | "sad" {
  switch (status) {
    case "normal":
      return "happy";
    case "elevated":
      return "neutral";
    case "high":
      return "worried";
    case "low":
      return "sad";
  }
}

export function getMascotMessage(status: GlucoseStatus): string {
  switch (status) {
    case "normal":
      return "Tudo certo! Continue assim!";
    case "elevated":
      return "Um pouco elevado. Fique de olho!";
    case "high":
      return "Valor alto. Atenção redobrada!";
    case "low":
      return "Valor baixo. Cuide-se agora!";
  }
}

export function getInsightMessage(status: GlucoseStatus): string {
  switch (status) {
    case "normal":
      return "Sua glicose está dentro da faixa ideal. Continue cuidando bem de você!";
    case "elevated":
      return "Sua glicose está um pouco elevada. Considere uma caminhada leve.";
    case "high":
      return "Glicose alta detectada. Considere consultar seu médico se persistir.";
    case "low":
      return "Glicose baixa. Consuma algo com açúcar agora e descanse.";
  }
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}
