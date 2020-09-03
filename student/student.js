(() => {
  "use strict";

  console.log("e-dnevnik Plus za nastavnike je omogućen.");

  // Izračunava prosjek za tablicu ocjena u predmetu
  let gradesTable = document.getElementById("tbl-ocjene");
  if (!gradesTable) return;
  let totalGrades = 0, gradesSum = 0;

  gradesTable.querySelectorAll("td[id^='grade']").forEach((gradeBlock) => {
    let grades = gradeBlock.textContent.match(/\d+/g);
    if (grades) {
      for (let i = 0; i < grades.length; i++) {
        gradesSum += parseInt(grades[i]);
        totalGrades++;
      }
    }
  });

  let avgNumber = gradesSum / totalGrades;
  avgNumber = isNaN(avgNumber) ? "0,00" : avgNumber.toFixed(2).toString().replace(".", ",");
  let avgTitle = "Broj ocjena: " + totalGrades + " | Zbroj ocjena: " + gradesSum;
  let avg = document.getElementById("prosjek");

  if (avg) {  // Prostor za prosjek već postoji

    avg.textContent = "Prosjek ocjena: " + avgNumber;
    avg.title = avgTitle;
    avg.className = "plus-avg";

  } else {  // Izrada prostora za prosjek ispod tablice

    let old = document.getElementById("tbl-prosjek");
    old && old.remove();
    avg = document.createElement("div");
    avg.id = "tbl-prosjek";
    avg.innerHTML = ' \
    <table width="100%" class="normal"> \
      <tbody> \
        <tr> \
          <td> \
            <div id="prosjek" class="plus-avg" title="' + avgTitle + '"> \
            Prosjek ocjena: "' + avgNumber + '"</div> \
          </td> \
        </tr> \
      </tbody> \
    </table>';
    gradesTable.after(avg);

  }

})();