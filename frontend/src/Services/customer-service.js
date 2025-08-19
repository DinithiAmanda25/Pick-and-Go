import { HTTP } from "./httpCommon-service";

class CustomerService {


    // Register customer
    registerCustomer(data) {
    return HTTP.post("/customers/register", data, {
      headers: {
        "Content-Type": "application/json",
      }
    });
  }

  // Login customer
  login(formData) {
    return HTTP.post("/login", formData);
  }



}

export default new CustomerService();