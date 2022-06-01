
const express = require("express");
const router = express.Router();
const { isAuth } = require("../helpers/auth");
const { admin } = require("../helpers/auth");
const Job = require("../models/Job");
const Payday = require("../models/Payday");
const Desc = require("../models/Desc");
const { activar, senToClient, end } = require("../config.js");
const Empleado = require("../models/empleados");

// acrodarse de moficiar la fecha
// acrodarse de moficiar la fecha
// acrodarse de moficiar la fecha
// acrodarse de moficiar la fecha

router.get("/jobs/all-jobs-check", isAuth, async (req, res) => {
  const jobsCheck = await Job.find({ estado: true }).sort({
    date: "desc",
  });
  jobsCheck.forEach((e) => {
    console.log(e.date);
  });
  res.status(200).render("job/all-job-check.hbs", { jobsCheck });
});
router.get("/jobs/new-job", isAuth, (req, res) => {
  res.status(200).render("job/new-job.hbs");
});
router.post("/jobs/add-new-job", isAuth, async (req, res) => {
  let { name, dni, modelo, telf, description, precio, prioridad, trabajador } =
    req.body;
  telf = "51" + telf;
  const date = new Date(Date.now());
  const errors = [];
  const sendMessageAndSave = async (prioridad) => {
    let nombre = name.toLowerCase();
    let urgencia = prioridad;
    const newJob = new Job({
      name: nombre,
      telf,
      dni,
      modelo,
      description,
      precio,
      urgencia,
      date,
      trabajador,
    });
    newJob.user = req.user.id;
    await newJob.save();
    const job = await Job.find({ estado: false });
    let alta = job.filter((e) => {
      if (e.urgencia == prioridad) {
        return e;
      }
    });
    if (alta.length === 1) {
      let text = prioridad;
      console.log(prioridad, "activado");
      activar(text);
    }
    res.status(200).redirect("all-job");
  };
  if (!name) {
    errors.push({ text: "Escriba un name" });
  }
  if (!telf) {
    errors.push({ text: "Escriba un telf" });
  }
  if (!description) {
    errors.push({ text: "Escriba un description" });
  }
  if (!precio) {
    errors.push({ text: "Escriba un precio" });
  }
  if (errors.length > 0) {
    res.status(500).render("job/new-job.hbs", {
      errors,
      name,
      description,
      precio,
    });
  } else {
    if (prioridad === "alta") {
      sendMessageAndSave(prioridad);
    }
    if (prioridad === "media") {
      sendMessageAndSave(prioridad);
    }
    if (prioridad === "baja") {
      sendMessageAndSave(prioridad);
    }
  }
});
router.get("/jobs/new-job-fast", isAuth, (req, res) => {
  res.status(200).render("job/new-job-fast.hbs");
});
router.post("/jobs/add-new-job-fast", isAuth, async (req, res) => {
  let { name, dni, modelo, telf, description, precio, prioridad, trabajador } =
    req.body;
  telf = "51" + telf;
  const date = new Date(Date.now());
  const errors = [];
  const sendMessageAndSave = async (prioridad) => {
    let nombre = name.toLowerCase();
    let urgencia = prioridad;
    const newJob = new Job({
      name: nombre,
      telf,
      dni,
      modelo,
      description,
      precio,
      urgencia,
      date,
      trabajador,
    });
    newJob.user = req.user.id;
    await newJob.save();
    res.status(200).redirect("all-job");
  };
  if (!name) {
    errors.push({ text: "Escriba un name" });
  }
  if (!telf) {
    errors.push({ text: "Escriba un telf" });
  }
  if (!description) {
    errors.push({ text: "Escriba un description" });
  }
  if (!precio) {
    errors.push({ text: "Escriba un precio" });
  }
  if (errors.length > 0) {
    res.status(500).render("job/new-job.hbs", {
      errors,
      name,
      description,
      precio,
    });
  } else {
    if (prioridad === "alta") {
      sendMessageAndSave(prioridad);
    }
    if (prioridad === "media") {
      sendMessageAndSave(prioridad);
    }
    if (prioridad === "baja") {
      sendMessageAndSave(prioridad);
    }
  }
});
router.get("/jobs/all-job", isAuth, async (req, res) => {
  const jobs = await Job.find({ user: req.user.id, estado: false }).sort({
    date: "desc",
  });
  res.status(200).render("job/all-job.hbs", { jobs });
});
router.get("/jobs/edit-job/:id", isAuth, async (req, res) => {
  const dataJob = await Job.findById(req.params.id).lean();
  req.flash("success_msg", "trabajo actualizado correctamente");
  res.status(200).render("job/edit-job.hbs", { dataJob });
});
router.put("/jobs/edit/:id", isAuth, async (req, res) => {
  const { name, telf, description, precio } = req.body;
  await Job.findByIdAndUpdate(req.params.id, {
    name,
    telf,
    description,
    precio,
  });
  res.status(200).redirect("/jobs/all-job");
});
router.delete("/jobs/delete/:id", isAuth, async (req, res) => {
  const job_end = await Job.findById(req.params.id);
  const { name, telf } = job_end;
  senToClient(
    telf,
    "Hola" +
      name +
      "su equipo no se ah reparado satisfactoriamente en seguida le enviaremos un video de prueba resaltando los problemas, Gracias.Green Apple"
  );
  await Job.findByIdAndDelete(req.params.id);
  res.status(200).redirect("/jobs/all-job");
});
let mensual = 0;
router.post("/jobs/mes-job", isAuth, async (req, res) => {
  let { mes } = req.body;
  let trabajo_mensual = 0;
  let pagos_diarios_mensual = 0;
  const fecha = new Date(Date.now());
  mes = mes.toLowerCase();
  let year = fecha.getUTCFullYear();

  switch (mes) {
    case "enero":
      mes = 01;
      break;
    case "febrero":
      mes = 02;
      break;
    case "marzo":
      mes = 03;
      break;
    case "abril":
      mes = 04;
      break;
    case "mayo":
      mes = 05;
      break;
    case "junio":
      mes = 06;
      break;
    case "julio":
      mes = 07;
      break;
    case "agosto":
      mes = 08;
      break;
    case "septiembre":
      mes = 09;
      break;
    case "octubre":
      mes = 10;
      break;
    case "noviembre":
      mes = 11;
      break;
    case "diciembre":
      mes = 12;
      break;
  }
  let month = mes + 1;
  const job = await Job.aggregate([
    {
      $match: {
        estado: "true",
        date: {
          $gte: new Date(`${mes}/01/${year}`),
          $lt: new Date(`${month}/01/${year}`),
        },
      },
    },
    { $group: { _id: null, suma: { $sum: "$precio" } } },
  ]);
  const pagosDiariosMensuales = await Payday.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${mes}/01/${year}`),
          $lt: new Date(`${month}/01/${year}`),
        },
      },
    },
    { $group: { _id: null, suma: { $sum: "$precio" } } },
  ]);

  if (job.length) {
    trabajo_mensual = job[0].suma;
  }
  if (pagosDiariosMensuales.length) {
    pagos_diarios_mensual = pagosDiariosMensuales[0].suma;
  }
  mensual = trabajo_mensual - pagos_diarios_mensual;
  console.log(mensual);

  res.status(200).redirect("/jobs/mes-job");
});
router.get("/jobs/mes-job", isAuth, (req, res) => {
  res.render("job/mes-trabajo.hbs", { mensual });
});


router.get("/jobs/diario-job", isAuth, async (req, res) => {

  let totalDiario = 0;
  const fecha = new Date(Date.now());
  let dia = fecha.getDate();
  let mes = fecha.getMonth();
  let day = dia + 1;
  let year = fecha.getUTCFullYear();
  let newYear=year;
  mes++
  let month = mes ;




  if (dia <= 9) {
    dia = "0" + dia;
  }
   if (month === 13) {
    month = "0" + 1;
    newYear = year + 1;
  }


  const total = await Job.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${mes}/${dia}/${year}`),
          $lt: new Date(`${month}/${day}/${newYear}`),
        },
        estado: "true",
      },
    },
    { $group: { _id: null, suma: { $sum: "$precio" } } },
  ]);
  const pagosDiarios = await Payday.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${mes}/${dia}/${year}`),
          $lt: new Date(`${month}/${day}/${newYear}`),
        },
      },
    },
    { $group: { _id: null, suma: { $sum: "$precio" } } },
  ]);
  const trabjoDiario = await Job.find({
    date: {
      $gte: new Date(`${mes}/${dia}/${year}`),
      $lt: new Date(`${month}/${day}/${newYear}`),
    },
    estado: "true",
  });
  const pagoDiario = await Payday.find({
    date: {
      $gte: new Date(`${mes}/${dia}/${year}`),
      $lt: new Date(`${month}/${day}/${newYear}`),
    },
  });
  if (total.length > 0) {
    if (!pagoDiario[0]) {
      totalDiario = total[0].suma;
    } else {
      totalDiario = total[0].suma - pagosDiarios[0].suma;
    }
    res.render("job/diario-trabajo.hbs", {
      totalDiario,
      trabjoDiario,
      pagoDiario,
    });
  } else {
    res.render("job/diario-trabajo.hbs", {
      totalDiario,
      trabjoDiario,
      pagoDiario,
    });
  }
});


































router.put("/jobs/edita/:id", isAuth, async (req, res) => {
  const { bol } = req.body;
  await Job.findByIdAndUpdate(req.params.id, { estado: bol, date: Date.now() });
  const job_end = await Job.findById(req.params.id);
  const { name, telf } = job_end;
  await senToClient(
    telf,
    "Hola" +
      name +
      "su equipo se ah reparado satisfactoriamente en seguida le enviaremos un video de prueba, Gracias.Green Apple"
  );
  res.status(200).redirect("/jobs/all-job");
});
router.put("/jobs/entregado/:id", isAuth, async (req, res) => {
  const { bol } = req.body;
  console.log(bol);
  await Job.findByIdAndUpdate(req.params.id, {
    entregado: bol,
    date: Date.now(),
  });
  res.status(200).redirect("/jobs/all-job");
});
let trabajos = "";
router.get("/jobs/filter", isAuth, async (re, res) => {
  res.status(200).render("job/filter.hbs", { trabajos });
});
router.post("/jobs/filter", isAuth, async (req, res) => {
  const { name, dni } = req.body;
  let job = await Job.find({
    name: name.toLowerCase(),
    dni: dni,
  });
  if (!name.toLowerCase()) {
    job = await Job.find({
      dni: dni,
    });
  }
  trabajos = job;
  res.redirect("/jobs/filter");
});
router.get("/jobs/descuento/:id", isAuth, async (req, res) => {
  const descuento = await Desc.find({ tID: req.params.id });
  res.render("job/descuento.hbs", { descuento });
});
router.post("/diario-job/descuento", async (req, res) => {
  let { description, precio } = req.body;
  // id del trabajo
  const header = req.header("referer");
  const splitHeader = header.split("/");
  const id = splitHeader[5];
  const jobId = await Job.findById(id);
  const newDesc = new Desc({
    description,
    precio,
  });
  newDesc.tID = id;
  await newDesc.save();
  precio = jobId.precio - precio;
  const job = await Job.findByIdAndUpdate(id, { precio });
  res.redirect("/jobs/descuento/" + id);
});
router.get("/jobs/pago-diario/", isAuth, admin, async (req, res) => {
  const fecha = new Date(Date.now());
  let mes = fecha.getMonth();
  let mon = mes + 1;
  let year = fecha.getUTCFullYear();
  let newYear=year
  if(mon===13){
    mon="0"+1
    newYear++
  }
  mes++;
  const pagoDiario = await Payday.find({
    date: {
      $gte: new Date(`${mes}/01/${year}`),
      $lt: new Date(`${mon}/01/${newYear}`),
    },
  }).sort({ date: "desc" });

  res.render("job/pago-diario.hbs", { pagoDiario });
});

//descuento de pago diario mesual
router.post("/pago-diario", async (req, res) => {
  let { trabajador, description, precio } = req.body;
  trabajador = trabajador.toLowerCase();

  const empleado = await Empleado.find({ trabajador: trabajador });

  const id = empleado[0]._id;
  const newPago = empleado[0].pagoMensual - precio;

  await Empleado.findByIdAndUpdate(id, {
    pagoMensual: newPago,
  });

  const newPay = new Payday({
    description,
    trabajador,
    precio,
  });

  await newPay.save();
  res.redirect("/jobs/pago-diario/");
});







router.get("/jobs/empleados", isAuth, async (req, res) => {
  const fecha = new Date(Date.now());
  let mes = fecha.getMonth();
  let mensual_trabajo = 0;
  let year = fecha.getUTCFullYear();
  let newYear = year;
  mes++;
  let month = mes + 1
  if (mes < 0) {
    mes = 12 + mes;
    year--
  }
  if (month === 13) {
    month = "0" + 1;
    newYear = year + 1;
  }
  const { empleados } = req.query;

  const employe = empleados.toLocaleLowerCase();

  const pagosDiariosMensuales = await Payday.find({
    date: {
      $gte: new Date(`${mes}/01/${year}`),
      $lt: new Date(`${month}/01/${newYear}`),
    },
    trabajador: `${employe}`,
  });

  const trabajaTotalMensual = await Job.find({
    trabajador: employe,
    date: {
      $gte: new Date(`${mes}/01/${year}`),
      $lt: new Date(`${month}/01/${newYear}`),
    },
  });
  let total_job_pay_month = await Job.aggregate([
    {
      $match: {
        trabajador: `${employe}`,
        date: {
          $gte: new Date(`${mes}/01/${year}`),
          $lt: new Date(`${month}/01/${newYear}`),
        },
      },
    },
    { $group: { _id: null, suma: { $sum: "$precio" } } },
  ]);

  if (total_job_pay_month.length) {
    mensual_trabajo = total_job_pay_month[0].suma;
  }
  const empleado = await Empleado.find({ trabajador: `${employe}` });

  const { pagoMensual } = empleado[0];

  res.render("job/employees/pay-employed.hbs", {
    empleados,
    pagosDiariosMensuales,
    trabajaTotalMensual,
    pagoMensual,
    mensual_trabajo,
  });
});












































//renovar pago
router.post("/jobs/edit/empleados", async (req, res) => {
  const { empleados } = req.body;

  let trabajador = await Empleado.find({ trabajador: empleados });
  const id = trabajador[0]._id;
  const pagoDefaultMensual = trabajador[0].pagoDefaultMensual;

  await Empleado.findByIdAndUpdate(id, {
    pagoMensual: pagoDefaultMensual,
  });

  res.redirect("/jobs/pago-diario/");
});

//enviar mensaje
router.post("/jobs/enviar-mensaje", isAuth, async (req, res) => {
  console.log("entre a cerrar");
  await end();
  res.redirect("/jobs/all-job");
});

//RESTAR EL PAGO DIARIO A MI SUELDO Y  VER SI RENOVAR EL SUELDO
//PARA EL DEPLOY ESTO SE EJECUTARA CUANDO SE TERMINE EL DIA LABORAL
const get_pay_day_employe = async (empleoye) => {
  const fecha = new Date(Date.now());
  let year = fecha.getUTCFullYear();
  let dia = fecha.getDate();
  let mes = fecha.getMonth();
  let day = dia + 1;
  let pago_total_diario = 0;
  if (dia <= 9) {
    dia = "0" + dia;
  }
  if (mes <= 9) {
    mes++;
    mes = "0" + mes;
  }
  const total = await Payday.aggregate([
    {
      $match: {
        trabajador: empleoye,
        date: {
          $gte: new Date(`${mes}/${dia}/${year}`),
          $lt: new Date(`${mes}/${day}/${year}`),
        },
      },
    },
    { $group: { _id: null, suma: { $sum: "$precio" } } },
  ]);
  if (total.length > 0) {
    pago_total_diario = total[0].suma;
    return pago_total_diario;
  } else {
    return pago_total_diario;
  }
};
const renovar_pago_mensual = async (employe) => {
  let empleado = await Empleado.find({ trabajador: employe });
  const { fechaSgtPago, _id, pagoDefaultMensual } = empleado[0];
  const fecha_sgt_pago_empleado = get_date_string(fechaSgtPago);
  const fecha_actual = get_date_string(Date.now());

  if (fecha_actual === fecha_sgt_pago_empleado) {
    const sgtPago = fechaSgtPago.setMonth(fechaSgtPago.getMonth() + 1);
    console.log(
      " renovamos tu billete la fehca: ",
      fecha_actual,
      " es igual a tu sgt pago: ",
      fecha_sgt_pago_empleado
    );
    await Empleado.findByIdAndUpdate(_id, {
      fechaSgtPago: sgtPago,
      pagoMensual: pagoDefaultMensual,
    });
  } else {
    console.log(
      "no renovamos tu billete la fehca: ",
      fecha_actual,
      "no es igual a tu sgt pago: ",
      fecha_sgt_pago_empleado
    );
  }
};
const get_date_string = (date) => {
  const fecha = new Date(date);
  let mes = fecha.getMonth() + 1;
  let day = fecha.getDate();
  let year = fecha.getUTCFullYear();
  if (day <= 9) {
    day = "0" + day;
  }
  if (mes <= 9) {
    mes = "0" + mes;
  }
  return `${mes}/${day}/${year}`;
};
const sacar_pago_mensual = async (empleados) => {
  const fecha = new Date(Date.now());
  let mes = fecha.getMonth() + 1;
  let month = mes + 1;
  const employe = empleados.toLowerCase();
  let trabajaT = 0;
  let year = fecha.getUTCFullYear();

  //con esto sacare el monto actual del empleadoc
  let empleados_mensual = await Empleado.find({ trabajador: employe });

  //con esto saco la suma total del los pagos del "MES"!

  const total = await Payday.aggregate([
    {
      $match: {
        trabajador: `${employe}`,
        date: {
          $gte: new Date(`${mes}/01/${year}`),
          $lt: new Date(`${month}/01/${year}`),
        },
      },
    },
    { $group: { _id: null, suma: { $sum: "$precio" } } },
  ]);

  let { _id, pagoMensual } = empleados_mensual[0];
  if (total.length > 0) {
    trabajaT = pagoMensual - total[0].suma;
    await Empleado.findByIdAndUpdate(_id, { pagoMensual: trabajaT });
    return trabajaT;
  } else {
    return trabajaT;
  }
};
const check_pay_month = async () => {
  const pay = await get_pay_day_employe("yegor");
  const pay1 = await get_pay_day_employe("oscar");
  const pay2 = await get_pay_day_employe("bryan");
  const pay3 = await get_pay_day_employe("kendry");
  const pay4 = await get_pay_day_employe("kevin");

  await renovar_pago_mensual("yegor");
  await renovar_pago_mensual("oscar");
  await renovar_pago_mensual("bryan");
  await renovar_pago_mensual("kendry");
  await renovar_pago_mensual("kevin");
  if (pay) {
    sacar_pago_mensual("yegor");
  }
  if (pay1) {
    sacar_pago_mensual("oscar");
  }
  if (pay2) {
    sacar_pago_mensual("bryan");
  }
  if (pay3) {
    sacar_pago_mensual("kendry");
  }
  if (pay4) {
    sacar_pago_mensual("kevin");
  }
  const timeOut = setTimeout(check_pay_month, 86400000);
};
// check_pay_month();

module.exports = router;
