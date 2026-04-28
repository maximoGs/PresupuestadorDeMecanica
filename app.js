document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('itemsContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    const form = document.getElementById('budgetForm');
    const targetPhone = "5492615715889";

    // Initialize with one empty item
    addItemRow();

    addItemBtn.addEventListener('click', addItemRow);

    // Dynamic totals update
    form.addEventListener('input', updateTotals);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendToWhatsApp();
    });

    function addItemRow() {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="item-desc">
                <label class="mobile-label">Descripción</label>
                <input type="text" class="item-description" placeholder="Repuesto / Insumo" required>
            </div>
            <div class="item-row-inner">
                <div class="item-cant">
                    <label class="mobile-label">Cant.</label>
                    <input type="number" class="item-quantity" min="1" value="1" placeholder="Cant" required>
                </div>
                <div class="item-prec">
                    <label class="mobile-label">Precio U.</label>
                    <input type="number" class="item-price" min="0" step="100" placeholder="Precio ($)" required>
                </div>
            </div>
            <button type="button" class="btn btn-danger item-del" title="Eliminar">✕</button>
        `;

        row.querySelector('.item-del').addEventListener('click', () => {
            row.remove();
            checkHeaders();
            updateTotals();
        });

        itemsContainer.appendChild(row);
        checkHeaders();
    }

    function checkHeaders() {
        const desktopHeaders = document.getElementById('desktopHeaders');
        if (window.innerWidth >= 550 && itemsContainer.children.length > 0) {
            desktopHeaders.style.display = 'block';
        } else {
            desktopHeaders.style.display = 'none';
        }
    }

    window.addEventListener('resize', checkHeaders);

    function updateTotals() {
        let subtotalRepuestos = 0;
        
        // Calculate items
        const itemRows = document.querySelectorAll('.item-row');
        itemRows.forEach(row => {
            const qty = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            subtotalRepuestos += (qty * price);
        });

        // Get labor cost
        const manoObra = parseFloat(document.getElementById('trabajoCosto').value) || 0;
        const granTotal = subtotalRepuestos + manoObra;

        // Format currency
        const formatter = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        });

        document.getElementById('subtotalRepuestos').textContent = formatter.format(subtotalRepuestos);
        document.getElementById('subtotalManoObra').textContent = formatter.format(manoObra);
        document.getElementById('granTotal').textContent = formatter.format(granTotal);
        
        return { subtotalRepuestos, manoObra, granTotal, formatter };
    }

    function sendToWhatsApp() {
        const cliente = document.getElementById('cliente').value.trim();
        const vehiculo = document.getElementById('vehiculo').value.trim();
        const patente = document.getElementById('patente').value.trim();
        const trabajoDesc = document.getElementById('trabajoDesc').value.trim();

        const totals = updateTotals();

        let message = `*PRESUPUESTO MECÁNICO*\n\n`;
        message += `*Cliente:* ${cliente}\n`;
        message += `*Vehículo:* ${vehiculo}\n`;
        message += `*Patente:* ${patente}\n\n`;

        message += `*⚙️ REPUESTOS E INSUMOS:*\n`;
        const itemRows = document.querySelectorAll('.item-row');
        let hasItems = false;
        itemRows.forEach(row => {
            const desc = row.querySelector('.item-description').value.trim();
            const qty = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            
            if(desc && qty > 0) {
                hasItems = true;
                const subtotalItem = qty * price;
                message += `- ${qty}x ${desc} (${totals.formatter.format(price)} c/u) = ${totals.formatter.format(subtotalItem)}\n`;
            }
        });

        if(!hasItems) message += `_Sin repuestos cargados_\n`;
        
        message += `\n*Subtotal Repuestos:* ${totals.formatter.format(totals.subtotalRepuestos)}\n\n`;

        message += `*🔧 MANO DE OBRA:*\n`;
        message += `Detalle: ${trabajoDesc}\n`;
        message += `*Subtotal Mano de Obra:* ${totals.formatter.format(totals.manoObra)}\n\n`;

        message += `*💰 TOTAL PRESUPUESTO: ${totals.formatter.format(totals.granTotal)}*\n\n`;
        message += `_Los valores expresados están sujetos a modificaciones._`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
        
        // Open WhatsApp web / app
        window.open(whatsappUrl, '_blank');
    }
});
