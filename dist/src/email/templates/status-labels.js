"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusLabel = getStatusLabel;
function getStatusLabel(status) {
    const labels = {
        'PENDING': 'En attente',
        'IN_TRANSIT_USA': 'En transit (USA)',
        'DEPARTED_USA': 'A quitté USA',
        'IN_TRANSIT_HAITI': 'En transit vers Haiti',
        'ARRIVED_HAITI': 'Arrivé en Haiti',
        'READY_FOR_PICKUP': 'Prêt pour récupération',
        'PICKED_UP': 'Récupéré',
        'CANCELLED': 'Annulé',
    };
    return labels[status] || status;
}
//# sourceMappingURL=status-labels.js.map