export function parseMethod(methodString) {
    switch (methodString) {
        case 'local':
            return 'local';
        case 'network':
            return 'network';
        default:
            throw new Error(`Invalid method string: ${methodString}`);
    }
}
