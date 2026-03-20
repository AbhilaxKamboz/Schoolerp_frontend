import Swal from "sweetalert2";

export const successAlert = (title, text) =>
  Swal.fire({
    icon: "success",
    title,
    text,
    timer: 1500,
    showConfirmButton: false
  });

export const errorAlert = (title, text) =>
  Swal.fire({
    icon: "error",
    title,
    text
  });

export const confirmAlert = async (title, text) => {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Cancel"
  });
  return result.isConfirmed;
};
