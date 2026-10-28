/**
 * PINForm - Componente de Verificación de Seguridad (PIN)
 * =========================================================================
 * Maneja el ingreso de códigos de 6 dígitos con foco automático y validación.
 */
export const PINForm = {
    render(email = 'usuario@empresa.com') {
        return `
            <div class="pin-verification-container animate__animated animate__fadeInUp">
                <div class="text-center mb-4">
                    <p class="text-muted small mb-1">Hemos enviado un código a:</p>
                    <span class="fw-bold text-primary">${email}</span>
                </div>

                <div class="d-flex justify-content-between mb-4" id="pin-inputs" style="gap: 8px;">
                    <input type="text" maxlength="1" id="pin-digit-0" name="pin-0" autocomplete="one-time-code" aria-label="Dígito 1 del PIN" class="form-control text-center fw-bold p-0" style="width: 45px; height: 56px; font-size: 1.5rem;" data-index="0" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-1" name="pin-1" autocomplete="one-time-code" aria-label="Dígito 2 del PIN" class="form-control text-center fw-bold p-0" style="width: 45px; height: 56px; font-size: 1.5rem;" data-index="1" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-2" name="pin-2" autocomplete="one-time-code" aria-label="Dígito 3 del PIN" class="form-control text-center fw-bold p-0" style="width: 45px; height: 56px; font-size: 1.5rem;" data-index="2" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-3" name="pin-3" autocomplete="one-time-code" aria-label="Dígito 4 del PIN" class="form-control text-center fw-bold p-0" style="width: 45px; height: 56px; font-size: 1.5rem;" data-index="3" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-4" name="pin-4" autocomplete="one-time-code" aria-label="Dígito 5 del PIN" class="form-control text-center fw-bold p-0" style="width: 45px; height: 56px; font-size: 1.5rem;" data-index="4" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-5" name="pin-5" autocomplete="one-time-code" aria-label="Dígito 6 del PIN" class="form-control text-center fw-bold p-0" style="width: 45px; height: 56px; font-size: 1.5rem;" data-index="5" inputmode="numeric" placeholder="•">
                </div>

                <div id="pin-feedback" class="alert d-none py-2 small mb-4 text-center animate__animated animate__shakeX"></div>

                <button type="button" class="btn btn-primary w-100 py-3 fw-bold" id="btn-verify-pin">
                    <span>VERIFICAR IDENTIDAD</span>
                    <i class="bi bi-shield-check-fill ms-2"></i>
                </button>

                <div class="mt-4 text-center">
                    <p class="small text-muted mb-3">¿No recibiste el código? <a href="#" id="resend-pin" class="fw-semibold text-decoration-none">Reenviar PIN</a></p>
                    <button type="button" class="btn btn-link text-decoration-none text-muted small" id="back-to-login">
                        <i class="bi bi-arrow-left me-1"></i> Volver al inicio de sesión
                    </button>
                </div>
            </div>
        `;
    },

    init(onSuccess, onBack, onResend) {
        const inputs = document.querySelectorAll('#pin-inputs input');
        const btnVerify = document.getElementById('btn-verify-pin');
        const backBtn = document.getElementById('back-to-login');
        const resendBtn = document.getElementById('resend-pin');

        // Auto-foco y navegación entre campos
        inputs.forEach((input, idx) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= 0 && e.key <= 9) {
                    input.classList.add('filled');
                    if (idx < inputs.length - 1) inputs[idx + 1].focus();
                } else if (e.key === 'Backspace') {
                    input.classList.remove('filled');
                    if (idx > 0) inputs[idx - 1].focus();
                }
            });

            // Evitar caracteres no numéricos
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        });

        btnVerify.onclick = () => {
            const pin = Array.from(inputs).map(i => i.value).join('');
            if (pin.length === 6) {
                this.showFeedback('Validando identidad...', 'success');
                btnVerify.disabled = true;
                btnVerify.innerHTML = '<div class="buca-spinner sm" data-buca-perf="ignore"></div>';
                setTimeout(() => onSuccess(pin), 1500);
            } else {
                this.showFeedback('Por favor, ingrese el código completo.', 'error');
            }
        };

        if (resendBtn) {
            resendBtn.onclick = (e) => {
                e.preventDefault();
                this.showFeedback('Se ha reenviado un nuevo código a su correo.', 'success');
                if (onResend) onResend();
                console.log('[Auth] -> PIN reenviado');
            };
        }

        if (backBtn) {
            backBtn.onclick = (e) => {
                e.preventDefault();
                if (onBack) onBack();
            };
        }

        // Foco inicial
        setTimeout(() => inputs[0].focus(), 500);
    },

    showFeedback(message, type = 'error') {
        const area = document.getElementById('pin-feedback');
        if (!area) return;
        
        area.innerHTML = `<span>${message}</span>`;
        area.className = `alert alert-${type === 'error' ? 'danger' : 'success'} py-2 small mb-4 text-center animate__animated animate__shakeX`;
        area.classList.remove('d-none');
    }
};

export default PINForm;
