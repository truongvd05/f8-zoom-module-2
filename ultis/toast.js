export function showNotification(message) {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    if (message) {
        toast.innerText = message;
    }

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000); // 2 giây
}
