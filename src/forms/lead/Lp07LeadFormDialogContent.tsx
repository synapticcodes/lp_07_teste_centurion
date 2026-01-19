import React, { useEffect, useMemo, useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { ArrowRight, Lock, Mail, Phone, User, XCircle } from "lucide-react";

interface LeadFormVariantProps {
  isOpen: boolean;
  onClose: () => void;
}

type Situation = "aposentado" | "servidor_publico" | "clt" | null;

const TRACK_URL =
  "https://api-backoffice-production.up.railway.app/track/lL_R02aEAn1mfaKT3D84UXsOyNE7g7teIIAYJobA4tc";

const LEAD_FIELD_IDS = {
  name: "name",
  email: "email",
  phone: "phone",
};

const labelSituation = (value: Situation) => {
  switch (value) {
    case "aposentado":
      return "aposentado";
    case "servidor_publico":
      return "servidor público";
    default:
      return "interessado";
  }
};

const buildWhatsappUrl = (name: string, situation: Situation) => {
  const message = `Olá, me chamo ${name}, sou ${labelSituation(
    situation
  )} e tenho interesse em recuperar minha margem`;
  return `https://wa.me/551221210478?text=${encodeURIComponent(message)}`;
};

const CloseButton = ({ onClose }: { onClose: () => void }) => (
  <button
    type="button"
    onClick={onClose}
    className="absolute right-4 top-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 group"
    aria-label="Fechar formulário"
  >
    <svg
      className="w-4 h-4 text-gray-400 group-hover:text-lavender-500 transition-colors duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>
);

const QuestionBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-lavender/40 bg-white p-4">
    <p className="text-gray-900 font-semibold text-base mb-3">{title}</p>
    {children}
  </div>
);

const OptionButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="min-h-12 rounded-lg border font-semibold text-base transition-colors px-4 text-left bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
  >
    {label}
  </button>
);

export const Lp07LeadFormDialogContent = ({ isOpen, onClose }: LeadFormVariantProps) => {
  const [step, setStep] = useState<"qualify" | "disqualified" | "form">("qualify");
  const [situation, setSituation] = useState<Situation>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const sendDirectTracking = (eventKey: string, lead?: { name?: string; email?: string; phone?: string }) => {
    try {
      const eventId =
        (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function")
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const payload = JSON.stringify({
        event: eventKey,
        event_id: eventId,
        event_source_url: window.location?.href ?? undefined,
        lead: lead ?? undefined,
        extra: { source: "lp07-direct" },
      });
      if (navigator?.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(TRACK_URL, blob);
        return;
      }
      fetch(TRACK_URL, {
        method: "POST",
        mode: "no-cors",
        body: payload,
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Silent fail.
      });
    } catch {
      // Silent fail.
    }
  };

  const trackEvent = (eventKey: string, opts?: { lead?: { name?: string; email?: string; phone?: string } }) => {
    try {
      const tracker = (window as unknown as { wolfgangTrack?: (key: string, options?: unknown) => void })
        .wolfgangTrack;
      if (typeof tracker === "function") {
        tracker(eventKey, { ...(opts ?? {}), beacon: true });
        return;
      }
    } catch {
      // Silent fail: tracking nunca deve quebrar o fluxo do usuário.
    }

    try {
      const eventId =
        (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function")
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const payload = {
        event: eventKey,
        event_id: eventId,
        event_source_url: window.location?.href ?? undefined,
        lead: opts?.lead ?? undefined,
        extra: { source: "lp07-fallback" },
      };
      const body = JSON.stringify(payload);

      if (navigator?.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(TRACK_URL, blob)) return;
      }

      fetch(TRACK_URL, {
        method: "POST",
        mode: "no-cors",
        body,
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => {
        // Silent fail.
      });
    } catch {
      // Silent fail.
    }
  };

  const nameValidationError = useMemo(() => {
    const raw = formData.name;
    const normalized = raw.replace(/\s+/g, " ").trim();

    if (!normalized) return null;

    const hasInvalidChars = /[^\p{L}\s]/u.test(normalized);
    if (hasInvalidChars) return "Use apenas letras e espaços.";

    const parts = normalized.split(" ").filter(Boolean);
    if (parts.length < 2) return "É necessário que seja preenchido seu nome completo";

    return null;
  }, [formData.name]);

  const emailValidationError = useMemo(() => {
    const email = formData.email.trim();
    if (!email) return null;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) return "Informe um e-mail válido";
    return null;
  }, [formData.email]);

  useEffect(() => {
    if (isOpen) {
      setStep("qualify");
      setSituation(null);
      setFormData({ name: "", email: "", phone: "" });
      setFocusedField(null);
      setIsRedirecting(false);
    }
  }, [isOpen]);

  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) return;
    if (formData.phone.replace(/\D/g, "").length !== 11) return;
    if (nameValidationError || emailValidationError) return;

    const leadPayload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    trackEvent("FormSubmit", {
      lead: leadPayload,
    });

    sendDirectTracking("FormSubmit", leadPayload);

    const whatsappUrl = buildWhatsappUrl(formData.name, situation);

    setIsRedirecting(true);

    window.setTimeout(() => {
      trackEvent("FormSubmit", { lead: leadPayload });
      sendDirectTracking("FormSubmit", leadPayload);
    }, 500);

    window.setTimeout(() => {
      setStep("qualify");
      setSituation(null);
      setFormData({ name: "", email: "", phone: "" });
      setFocusedField(null);
      onClose();
      setIsRedirecting(false);
      window.location.href = whatsappUrl;
    }, 1200);
  };

  const isSubmitDisabled = useMemo(() => {
    const numbersOnly = formData.phone.replace(/\D/g, "");
    const hasValidLength = numbersOnly.length === 11;
    return (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !hasValidLength ||
      Boolean(nameValidationError) ||
      Boolean(emailValidationError)
    );
  }, [formData, nameValidationError, emailValidationError]);

  if (step === "disqualified") {
    return (
      <DialogContent className="sm:max-w-md rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-0 [&>button]:hidden">
        <CloseButton onClose={onClose} />

        <DialogHeader className="text-center pt-2">
          <DialogTitle className="text-purple-brand text-2xl font-bold tracking-tight leading-tight">
            Obrigado pelo interesse
          </DialogTitle>
          <p className="text-gray-600 text-base font-medium mt-2">
            No momento não atendemos casos CLT. Nosso atendimento é exclusivo para servidores públicos e beneficiários do INSS.
          </p>
        </DialogHeader>

        <div className="mt-6">
          <div className="rounded-xl border border-lavender bg-lavender/10 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <XCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
              <p className="text-gray-900 font-semibold text-base">Perfil não elegível</p>
            </div>
            <p className="text-gray-700 text-base">
              Se você for servidor público ou beneficiário do INSS, teremos prazer em ajudar. Quando esse for o seu caso, volte para refazer a triagem.
            </p>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="h-12 w-full bg-purple-brand hover:bg-lavender-800 text-white font-semibold rounded-lg"
            >
              Entendi
            </Button>
          </div>
        </div>

        {isRedirecting ? (
          <div className="absolute inset-0 z-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center px-6">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-purple-brand border-t-transparent animate-spin" />
              <p className="text-gray-900 font-semibold text-base">Aguarde um instante</p>
              <p className="text-gray-600 text-sm mt-1">
                Estamos enviando seus dados e redirecionando para o WhatsApp.
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    );
  }

  if (step === "qualify") {
    return (
      <DialogContent className="sm:max-w-md rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-0 [&>button]:hidden">
        <CloseButton onClose={onClose} />
        <DialogHeader className="text-center pt-2">
          <DialogTitle className="text-purple-brand text-2xl font-bold tracking-tight leading-tight">
            Triagem rápida
          </DialogTitle>
          <p className="text-gray-600 text-base font-medium mt-2">
            Responda para confirmarmos se conseguimos te ajudar.
          </p>
        </DialogHeader>

        <div className="space-y-5 mt-6">
          <QuestionBlock title="Qual sua situação?">
            <div className="grid gap-3">
              <OptionButton
                label="1 - Aposentado"
                onClick={() => {
                  setSituation("aposentado");
                  setStep("form");
                }}
              />
              <OptionButton
                label="2 - Servidor público"
                onClick={() => {
                  setSituation("servidor_publico");
                  setStep("form");
                }}
              />
              <OptionButton
                label="3 - CLT"
                onClick={() => {
                  setSituation("clt");
                  setStep("disqualified");
                }}
              />
            </div>
          </QuestionBlock>
        </div>

        {isRedirecting ? (
          <div className="absolute inset-0 z-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center px-6">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-purple-brand border-t-transparent animate-spin" />
              <p className="text-gray-900 font-semibold text-base">Aguarde um instante</p>
              <p className="text-gray-600 text-sm mt-1">
                Estamos enviando seus dados e redirecionando para o WhatsApp.
              </p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-md rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border-0 [&>button]:hidden">
      <CloseButton onClose={onClose} />

      <DialogHeader className="text-center pt-2">
        <DialogTitle className="text-purple-brand text-2xl font-bold tracking-tight leading-tight">
          Preencha seus dados
        </DialogTitle>
        <p className="text-gray-600 text-base font-medium mt-2">
          É rápido e seguro. Seus dados ficam protegidos.
        </p>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <FloatingLabelInput
          id={LEAD_FIELD_IDS.name}
          type="text"
          placeholder="Nome completo"
          label="Nome completo"
          value={formData.name}
          onChange={(value) => handleInputChange("name", value)}
          icon={User}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
          required
          validationError={nameValidationError ?? undefined}
        />

        <FloatingLabelInput
          id={LEAD_FIELD_IDS.email}
          type="email"
          placeholder="E-mail"
          label="E-mail"
          value={formData.email}
          onChange={(value) => handleInputChange("email", value)}
          icon={Mail}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
          required
          validationError={emailValidationError ?? undefined}
        />

        <FloatingLabelInput
          id={LEAD_FIELD_IDS.phone}
          type="tel"
          placeholder="WhatsApp"
          label="WhatsApp"
          value={formData.phone}
          onChange={(value) => handleInputChange("phone", value)}
          icon={Phone}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
          required
          validationError={
            formData.phone && formData.phone.replace(/\D/g, "").length !== 11
              ? "Informe um WhatsApp com DDD (11 dígitos)"
              : undefined
          }
        />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full h-12 bg-purple-brand hover:bg-lavender-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            Enviar
            <ArrowRight className="w-4 h-4 text-yellow-vibrant" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 pt-2">
          <Lock className="w-4 h-4" />
          <span>Seus dados estão seguros.</span>
        </div>
      </form>

      {isRedirecting ? (
        <div className="absolute inset-0 z-10 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center px-6">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-purple-brand border-t-transparent animate-spin" />
            <p className="text-gray-900 font-semibold text-base">Aguarde um instante</p>
            <p className="text-gray-600 text-sm mt-1">
              Estamos enviando seus dados e redirecionando para o WhatsApp.
            </p>
          </div>
        </div>
      ) : null}
    </DialogContent>
  );
};
