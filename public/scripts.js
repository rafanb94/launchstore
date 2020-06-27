const currentPagePath = location.pathname;
const menuItems = document.querySelectorAll("header .links a");

for (item of menuItems) {
  if (currentPagePath.includes(item.getAttribute("href"))) {
    item.classList.add("active");
  }
}

const formDelete = document.querySelector("#form-delete");
if (formDelete != null) {
  formDelete.addEventListener("submit", function (event) {
    const confirmation = confirm("Deseja realmente deletar?");
    if (!confirmation) {
      event.preventDefault();
    }
  });
}

function paginate(selectedPage, totalPages) {
  let pages = [],
    oldPage;

  for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
    const firstAndLastPage = currentPage == 1 || currentPage == totalPages;
    const pagesAfterSelectedPage = currentPage <= selectedPage + 2;
    const pagesBeforeSelectedPage = currentPage >= selectedPage - 2;

    if (
      firstAndLastPage ||
      (pagesBeforeSelectedPage && pagesAfterSelectedPage)
    ) {
      if (oldPage && currentPage - oldPage > 2) {
        pages.push("...");
      }

      if (oldPage && currentPage - oldPage == 2) {
        pages.push(oldPage + 1);
      }
      pages.push(currentPage);
      oldPage = currentPage;
    }
  }
  return pages;
}

const pagination = document.querySelector(".pagination");

function createPagination(pagination) {
  const filter = pagination.dataset.filter;
  const page = +pagination.dataset.page;
  const total = +pagination.dataset.total;
  const pages = paginate(page, total);

  let elements = "";

  for (let page of pages) {
    if (String(page).includes("...")) {
      elements += `<span>${page}</span>`;
    } else {
      if (filter) {
        elements += `<a href="?page=${page}&filter=${filter}">${page}</a>`;
      } else {
        elements += `<a href="?page=${page}">${page}</a>`;
      }
    }
  }
  pagination.innerHTML = elements;
}
if (pagination) {
  createPagination(pagination);
}

const Mask = {
  apply(input, func) {
    setTimeout(function () {
      input.value = Mask[func](input.value);
    }, 1);
  },
  formatBRL(value) {
    value = value.replace(/\D/g, "");

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  },
  cpfCnpj(value) {
    value = value.replace(/\D/g, "");

    if (value.length > 14) value = value.slice(0, -1);

    if (value.length > 11) {
      value = value.replace(/(\d{2})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1-$2");
    }
    return value;
  },
  cep(value) {
    value = value.replace(/\D/g,"");

   if(value.length > 8) value = value.slice(0, -1);
    value = value.replace(/(\d{5})(\d)/, "$1-$2");

    return value;
  },
};

const PhotosUpload = {
  input: "",
  preview: document.querySelector("#photos-preview"),
  uploadLimit: 6,
  files: [],

  handleFileInput(event) {
    const { files: fileList } = event.target;
    PhotosUpload.input = event.target;

    if (PhotosUpload.hasLimit(event)) {
      return;
    }
    Array.from(fileList).forEach((file) => {
      PhotosUpload.files.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.src = String(reader.result);

        const div = PhotosUpload.getContainer(image);
        PhotosUpload.preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
    PhotosUpload.input.files = PhotosUpload.getAllFiles();
  },

  getAllFiles() {
    const dataTransfer = new DataTransfer();
    PhotosUpload.files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  },

  hasLimit(event) {
    const { uploadLimit, input, preview } = PhotosUpload;
    const { files: fileList } = input;

    if (fileList.length > uploadLimit) {
      alert(`Envie no maximo ${uploadLimit} fotos`);
      event.preventDefault();
      return true;
    } else {
      alert("dentro do limite máximo");
    }

    const photosDiv = [];
    preview.childNodes.forEach((item) => {
      if (item.classList && item.classList.value == "photo")
        photosDiv.push(item);
    });

    const totalPhotos = fileList.length + photosDiv.length;
    if (totalPhotos > uploadLimit) {
      alert("Você atingiu o limite máximo de fotos");
      event.preventDefault();
      return true;
    }
    alert("dentro do limite máximo");
    return false;
  },

  getContainer(image) {
    const div = document.createElement("div");
    div.classList.add("photo");
    div.appendChild(image);

    div.onclick = PhotosUpload.removePhoto;
    div.appendChild(PhotosUpload.getRemoveButton());
    return div;
  },
  getRemoveButton() {
    const button = document.createElement("i");
    button.classList.add("material-icons");
    button.innerHTML = "close";
    return button;
  },
  removePhoto(event) {
    const photoDiv = event.target.parentNode;
    const photosArray = Array.from(PhotosUpload.preview.children);
    const index = photosArray.indexOf(photoDiv);
    PhotosUpload.files.splice(index, 1);
    PhotosUpload.input.files = PhotosUpload.getAllFiles();
    photoDiv.remove();
    console.log(PhotosUpload.files);
  },
  removeOldPhoto(event) {
    const photoDiv = event.target.parentNode;
    if (photoDiv.id) {
      const removedFiles = document.querySelector(
        'input[name="removed_files"]'
      );
      if (removedFiles) {
        removedFiles.value += `${photoDiv.id},`;
      }
    }
    photoDiv.remove();
  },
};

const ImageGallery = {
  highlight: document.querySelector(".gallery .highlight> img"),
  previews: document.querySelectorAll(".gallery-preview img"),
  setImage(e) {
    const { target } = e;
    ImageGallery.previews.forEach((preview) =>
      preview.classList.remove("active")
    );
    target.classList.add("active");
    ImageGallery.highlight.src = target.src;
    Lightbox.image.src = target.src;
  },
};

const Lightbox = {
  target: document.querySelector(".lightbox-target"),
  image: document.querySelector(".lightbox-target img"),
  closeButton: document.querySelector(".lightbox-target a.lightbox-close"),
  open() {
    Lightbox.target.style.opacity = 1;
    Lightbox.target.style.top = 0;
    Lightbox.target.style.bottom = 0;
  },

  close() {
    Lightbox.target.style.opacity = 0;
    Lightbox.target.style.top = "-100%";
    Lightbox.target.style.bottom = "initial";
  },
};

const Validate = {
  apply(input, func) {
    Validate.clearErrors(input)
    let results = Validate[func](input.value);
    input.value = results.value;

    if(results.error)
    Validate.displayError(input, results.error)

  },
  displayError (input, error){
    const div = document.createElement('div')
    div.classList.add('error')
    div.innerHTML = error
    input.parentNode.appendChild(div)
  },
  
  clearErrors(input){
    const errorDiv = input.parentNode.querySelector(".error")
    if(errorDiv)
    errorDiv.remove()
  },
  isEmail(value) {
    let error = null;
    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    
    if (!value.match(mailFormat))
        error = "Email inválido"
    return {
      error,
      value,
    };
  },
  isCpfCnpj(value) {
    let error = null
    const cleanValues = value.replace(/\D/g,"")

    if (cleanValues.length > 11 && cleanValues.length !== 14){
      error = "CNPJ incorreto"
    } else if (cleanValues.length < 12 && cleanValues.length !== 11){
      error = "CPF incorreto"
    }
    return {
      error,
      value,
    };
  },
  isCep(value) {
    let error = null
    const cleanValues = value.replace(/\D/g, "")
    
  if (cleanValues.length !== 8){
    error = "CEP inválido"
  }
    return {
      error,
      value
    }
  }
  }

