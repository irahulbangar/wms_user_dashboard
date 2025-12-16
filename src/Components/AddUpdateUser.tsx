import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useAppDispatch } from "../../store/store";
import {
  addUser,
  updateUser,
  type AddUserPayload,
  type UpdateUserPayload,
} from "../../store/usersSlice";
import { Success, Error } from "../utils/toast";
import type { UsersPlantIdResult } from "../../model/users-plantId.interface";

interface AddUpdateUserProps {
  isOpen: boolean;
  onClose: () => void;
  editUser?: UsersPlantIdResult | null;
  onSuccess: () => void;
}

const AddUpdateUser = ({
  isOpen,
  onClose,
  editUser,
  onSuccess,
}: AddUpdateUserProps) => {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_password: "",
    status: "active",
    plant_id: Number(localStorage.getItem("plantId")) || 0,
    organization_id: Number(localStorage.getItem("organizationId")) || 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        setFormData({
          client_name: editUser.client_name || "",
          client_email: editUser.client_email || "",
          client_phone: editUser.client_phone || "",
          client_password: editUser.client_password || "",
          status: editUser.status || "active",
          plant_id: Number(localStorage.getItem("plantId")) || 0,
          organization_id: Number(localStorage.getItem("organizationId")) || 0,
        });
      } else {
        setFormData({
          client_name: "",
          client_email: "",
          client_phone: "",
          client_password: "",
          status: "active",
          plant_id: Number(localStorage.getItem("plantId")) || 0,
          organization_id: Number(localStorage.getItem("organizationId")) || 0,
        });
      }
    }
  }, [isOpen, editUser]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.client_name.trim()) {
      Error("Name is required");
      return false;
    }
    if (!formData.client_email.trim()) {
      Error("Email is required");
      return false;
    }
    if (!formData.client_phone.trim()) {
      Error("Phone is required");
      return false;
    }

    if (!formData.client_password.trim()) {
      Error("Password is required");
      return false;
    }

    if (formData.client_password.length < 6) {
      Error("Password must be at least 6 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.client_email)) {
      Error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editUser) {
      const updateData: UpdateUserPayload = {
        client_id: editUser.client_id,
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        client_password: formData.client_password,
        status: formData.status,
        plant_id: formData.plant_id,
        organization_id: formData.organization_id,
      };

      await dispatch(updateUser(updateData))
        .unwrap()
        .then((res) => {
          if (res.success) {
            Success(res.message || "User updated successfully");
            onSuccess();
            onClose();
          } else {
            Error(res.message || "Failed to update user");
          }
        })
        .catch((err) => {
          Error(err.message || "Failed to update user");
        });
    } else {
      await dispatch(addUser(formData as AddUserPayload))
        .unwrap()
        .then((res) => {
          if (res.success) {
            Success(res.message || "User added successfully");
            onSuccess();
            onClose();
          } else {
            Error(res.message || "Failed to add user");
          }
        })
        .catch((err) => {
          Error(err.message || "Failed to add user");
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary sticky top-0 bg-primary z-10">
          <h2 className="text-xl font-medium text-text-primary font-roboto">
            {editUser ? "Update User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-normal text-text-primary mb-2 font-roboto">
              Name
            </label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary border-border-primary"
              placeholder="Enter name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-normal text-text-primary mb-2 font-roboto">
              Email
            </label>
            <input
              type="email"
              name="client_email"
              value={formData.client_email}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary border-border-primary"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-normal text-text-primary mb-2 font-roboto">
              Phone
            </label>
            <input
              type="tel"
              name="client_phone"
              value={formData.client_phone}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary border-border-primary"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-normal text-text-primary mb-2 font-roboto">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="client_password"
                value={formData.client_password}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 pr-10 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary border-border-primary"
                placeholder={editUser ? "Enter new password" : "Enter password"}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-normal text-text-primary mb-2 font-roboto">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-status-info bg-primary text-text-primary border-border-primary"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-border-primary text-text-primary rounded-lg hover:bg-secondary transition-colors font-roboto cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-linear-to-r text-white rounded-lg hover:shadow-lg transition-all duration-200 font-roboto flex items-center justify-center gap-2 cursor-pointer"
            >
              {editUser ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateUser;
