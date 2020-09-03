(() => {
  "use strict";

  // Tip korisnika (Administrator > Ravnatelj > Stručni suradnik > Razrednik > Nastavnik)
  const userType = document.querySelector(".user .type").textContent.trim();
  const parser = new DOMParser();
  let selectedSubject = "";

  // Stvaranje gumba 'Plus'
  let randomButton = document.getElementsByClassName("icon-random")[0];
  let plusButton = document.createElement("div");
  let plusButtonClicked = false;
  plusButton.className = "button2 plus-button";
  plusButton.textContent = "Plus";
  randomButton.after(plusButton);
  plusButton.onclick = plusClicked;

  /*
  Makni komentar kako bi onemogućio gumb 'Plus'; CSS:4:12
  ..............................................
  let notAvailable = document.createElement("div");
  notAvailable.className = "plus-button-down-note";
  notAvailable.innerHTML = "Opcija je privremeno onemogućena kako bi \
    <br> se smanjio rizik od preopterećenja sustava.";
  plusButton.appendChild(notAvailable);
  plusButtonClicked = true;
  */

  /**
   * Klikom na gumb 'Plus' izračunavaju se prosjeci.
   * Ako nije prijavljen nastavnik, otvara se popis predmeta za razred.
   * Jedino nastavnik odmah ulaskom u učenika vidi tablice ocjena,
   * a svi ostali rankovi imaju pristup popisu predmeta.
   * @listens onclick
   */
  function plusClicked() {

    // Gumb je moguće kliknuti samo jednom
    if (plusButtonClicked) return;
    plusButtonClicked = true;

    // Popis učenika
    let students = document.querySelectorAll("#content > a.student");
    if (!students.length) return plusButton.classList.add("plusClicked");

    if (userType == "nastavnik") {
      plusButton.textContent = "Učitavanje...";
      setTimeout(() => loadStudents(students));
      return;  // Izravno učitavanje
    }

    // Korisnik bira koji predmet se uzima za svakog učenika
    plusButton.style.maxWidth = "unset";
    plusButton.textContent = "Odaberite predmet";

    // Dropdown lista predmeta
    const subjectsList = document.createElement("div");
    subjectsList.className = "plus-button-down-note";
    plusButton.appendChild(subjectsList);

    // Dobavljanje predmeta
    const doc = getPage("https://e-dnevnik.skole.hr/admin_class/class_courses");
    doc.querySelectorAll("#content .class_course").forEach(subject => {
      subject = subject.firstChild.textContent.trim().replace(/^\d*\./, "").trim();

      const row = document.createElement("div");
      row.className = "plus-subject-row";
      row.textContent = subject;

      subjectsList.appendChild(row).onclick = () => {
        if (selectedSubject) return;
        selectedSubject = " (" + subject + ")";
        plusButton.firstChild.textContent = "Učitavanje...";

        // Brisanje prethodno kreiranih elemenata za ponovni odabir
        document.querySelectorAll(".studentAvg, .classAvg").forEach(el => el.remove());

        // Klikom na predmet dobavljaju se linkovi od svakog učenika prema tome predmetu
        setTimeout(() => getStudentSubjectLinks(students, subject));
      };
    });
  }

  /**
   * Dobavlja i prosljeđuje veze prema predmetu za svakog učenika
   * @param {HTMLCollection} students - Učenici
   * @param {String} targetSubject - Odabrani predmet
   */
  function getStudentSubjectLinks(students, targetSubject) {
    const links = [];
    students.forEach((student) => {
      let url = student.href;
      if (!url) return;

      let alignRight = student.querySelector(".right")
      let doc = getPage(url);
      let subjects = doc.querySelectorAll("#content a.ed-row");

      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        if (subject.firstChild.textContent.trim() == targetSubject && subject.href) {
          return links.push({alignRight: alignRight, href: subject.href});
        }
      }
    });
    loadStudents(links);
  }

  /**
   * Učitava prosjeke i statistiku svih učenika.
   * @param {HTMLCollection|Object} students - Učenici: Link + Mjesto elementa za prosjeke
   */
  function loadStudents(students) {
    let totalGradesEach = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0};
    let totalAvgsEach = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0};
    let totalAvgs = 0, totalAvgsRoundedSum = 0;
    let totalGradesCount = 0, totalGradesSum = 0;
    let startTime = Date.now();
    let studentsQueue = [];
    students.forEach((student) => studentsQueue.push(getAverage(student)));

    // Promise se može izostaviti jer svi su requestovi synchronous
    Promise.all(studentsQueue).then((values) => {
      console.log("[e-D+] Vrijeme učitavanja (ms): " + (Date.now() - startTime));

      for (let i = 0; i < values.length; i++) {
        if (!values[i]) continue;

        let gradesEach = values[i].gradesEach;
        let gradesCount = values[i].gradesCount;
        let gradesSum = values[i].gradesSum;
        let avg = Math.round(values[i].avg);

        if (!gradesCount) continue;

        for (let k in gradesEach) {
          totalGradesEach[k] += gradesEach[k];
        }
        totalGradesCount += gradesCount;
        totalGradesSum += gradesSum;

        totalAvgsRoundedSum += avg;
        totalAvgsEach[avg]++;
        totalAvgs++;
      }

      let contentTitle = document.querySelector(".content>.title-select");
      let totalRoundedAvg = totalAvgsRoundedSum / totalAvgs;
      totalRoundedAvg = isNaN(totalRoundedAvg) ? "0,00" :
        totalRoundedAvg.toFixed(2).toString().replace(".", ",");
      let totalGradesAvg = totalGradesSum / totalGradesCount;
      totalGradesAvg = isNaN(totalGradesAvg) ? "0,00" :
        totalGradesAvg.toFixed(2).toString().replace(".", ",");

      let totalAvgContainer = document.createElement("div");
      totalAvgContainer.className = "classAvg";
      totalAvgContainer.innerHTML = "Prosjek razreda" + selectedSubject + ": " + totalRoundedAvg +
      '<sup>?</sup><div class="stats"> \
      <table class="statsTable"> \
        <tbody> \
            <tr> \
              <td></td> \
              <td id="final-grades">Zaključne ocjene<sup>?</sup></td> \
              <td id="final-total">Sve ocjene<sup>?</sup></td> \
            </tr> \
            <tr> \
              <td>Odličnih:</td> \
              <td>' + (totalAvgsEach["5"] || "") + '</td> \
              <td>' + (totalGradesEach["5"] || "") + '</td> \
            </tr> \
            <tr> \
              <td>Vrlo dobrih:</td> \
              <td>' + (totalAvgsEach["4"] || "") + '</td> \
              <td>' + (totalGradesEach["4"] || "") + '</td> \
            </tr> \
            <tr> \
              <td>Dobrih:</td> \
              <td>' + (totalAvgsEach["3"] || "") + '</td> \
              <td>' + (totalGradesEach["3"] || "") + '</td> \
            </tr> \
            <tr> \
              <td>Dovoljnih:</td> \
              <td>' + (totalAvgsEach["2"] || "") + '</td> \
              <td>' + (totalGradesEach["2"] || "") + '</td> \
            </tr> \
            <tr> \
              <td>Nedovoljnih:</td> \
              <td>' + (totalAvgsEach["1"] || "") + '</td> \
              <td>' + (totalGradesEach["1"] || "") + '</td> \
            </tr> \
            <tr> \
              <td>Ukupno ocjena:</td> \
              <td>' + totalAvgs + '</td> \
              <td>' + totalGradesCount + '</td> \
            </tr> \
            <tr> \
              <td>Prosjek razreda:</td> \
              <td>' + totalRoundedAvg + '</td> \
              <td>' + totalGradesAvg + '</td> \
            </tr> \
        </tbody> \
      </table>';

      contentTitle.appendChild(totalAvgContainer);

      if (selectedSubject) {
        plusButton.firstChild.textContent = "Odaberite predmet";
        selectedSubject = "";
      } else {
        plusButton.classList.add("plusClicked");  // Za nastavnika je kraj priče
      }
    });
  }

  /**
   * Izračunava prosjek učenika i popunjava podatke za statistiku.
   * @param {HTMLElement|Object} student
   */
  function getAverage(student) {
    return new Promise((resolve) => {

      let url = student.href;
      if (!url) { resolve(false); return; }
      let doc = getPage(url);

      try {
        let totalGrades = 0, gradesSum = 0;
        let gradesEach = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0};

        let gradesTable = doc.getElementById("tbl-ocjene");
        gradesTable.querySelectorAll("td[id^='grade']").forEach((gradeBlock) => {
          let grades = gradeBlock.innerText.match(/\d+/g);
          if (grades) {
            for (let i = 0; i < grades.length; i++) {
              gradesSum += parseInt(grades[i]);
              gradesEach[grades[i].toString()]++;
              totalGrades++;
            }
          }
        });

        let alignRight = student.alignRight || student.querySelector(".right");
        let averageContainer = document.createElement("div");
        let numOfGradesContainer = document.createElement("div");
        let avgNumber = gradesSum / totalGrades;
        resolve({gradesEach: gradesEach, gradesCount: totalGrades, gradesSum: gradesSum, avg: avgNumber});

        if (avgNumber < 1.5) {
          averageContainer.style.color = "red";
        }

        avgNumber = isNaN(avgNumber) ? "0,00" : avgNumber.toFixed(2).toString().replace(".", ",");
        averageContainer.className = numOfGradesContainer.className = "studentAvg";
        averageContainer.textContent = avgNumber;
        numOfGradesContainer.textContent = totalGrades;
        averageContainer.title = "Prosjek ocjena";
        numOfGradesContainer.title = "Broj ocjena";

        alignRight.appendChild(averageContainer);
        alignRight.appendChild(numOfGradesContainer);

      } catch(e) {

        console.log(e);
        resolve(false);
      }
    });
  }

  /**
   * Dobavlja i parsira HTML dokument.
   * @param {String} url - Link stranice koja se preuzima
   */
  function getPage(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    return parser.parseFromString(xhr.responseText, "text/html");
  }

})();