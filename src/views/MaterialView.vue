<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Form, Field, ErrorMessage } from 'vee-validate';
import "@/composables/custom-vee-validate";
import * as yup from "yup";
import { deepEqual } from "@/composables/objectUtils";
import { Money3 } from 'v-money3';
import { showModal } from '@/composables/modalUtils';
import { showToast } from '@/composables/toastUtils';
import { formatToDatabaseDate, formatToBrDate } from '@/composables/date-utils';
import axiosInstance from '@/axiosInstance';
// State
const route = useRoute();
const router = useRouter();
const isEditMode = ref(!!route.params.materialId);
// Validation schema
const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório').max(30, 'Máximo de 30 caracteres'),
  marca: yup.string().required('Marca é obrigatório').max(30, 'Máximo de 30 caracteres'),
  unidade: yup.string().required('Unidade é obrigatório'),
  preco: yup
    .number()
    .typeError("Preço deve ser um número válido")
    .positive("O preço deve ser maior que zero")
    .required("Preço é obrigatório"),
  /*
  estoque: yup
    .number()
    .typeError("Estoque deve ser um número válido"),
  */
});
const state = reactive({
  material: {
    id: null,
    nome: "",
    marca: "",
    unidade: "",
    preco: 0,
  },
  isProcessing: false,
});
// Função para verificar alterações
const hasChanges = (newValues) => {
  return !deepEqual(newValues, state.material);
};
onMounted(async () => {
  state.isProcessing = true;
  if (isEditMode.value) {
    try {
      const { data } = await axiosInstance.get(`/materiais/${route.params.materialId}`);
      console.log(data);
      state.material = data;
      state.material = {
        ...state.material, // Mantém valores padrão caso não venham da API
        ...data,
        preco: data.preco ?? 0, // Se preco for undefined, assume 0
      };
    } catch (error) {
      showToast("erro", "Erro ao carregar material: ", error);
    }
  }
  state.isProcessing = false;
});
// Função de envio do formulário
const onSubmit = async (values, { resetForm }) => {
  //formata a data para o padrão mysql
  const formattedValues = {
    ...values,
    preco: parseFloat(values.preco) || 0, // Converte para número
  };
  if (isEditMode.value) {
    // Verifica se houve alterações nos valores do formulário
    if (!hasChanges(values)) {
      showToast("info", "Não houve alterações no material.");
      return;
    };
    // Abre o modal de confirmação no modo de edição
    const modal = showModal(
      "Editar Material",
      "Confirma a edição do material?",
      async () => {
        try {
          state.isProcessing = true;
          await axiosInstance.put(`/materiais/${values.id}`, formattedValues);
          showToast("sucesso", "Material editado com sucesso!");
          resetForm();
          router.push("/materiais");
        } catch (error) {
          if (error.response && error.response.data && error.response.data.errors) {
            error.response.data.errors.forEach((err) => {
              showToast("erro", err);
            });
          } else {
            showToast("erro", "Erro inesperado ao validar.");
            console.error(error);
          }
        } finally {
          state.isProcessing = false;
          modal.hide(); // Fecha o modal
        }
      }
    );
  } else {
    // Validação no backend (somente no fluxo de criação)
    try {
      const validacao = await validarMaterial(formattedValues);
    } catch (error) {
      console.warn("Erro tratado:", error.message);
      return;
    }
    // Criação de um novo material
    try {
      state.isProcessing = true;
      await axiosInstance.post("/materiais", formattedValues);
      showToast("sucesso", "Material cadastrado com sucesso!");
      resetForm();
      router.push("/materiais");
    } catch (error) {
      console.warn("Erro tratado:", error.message);
      return;
    } finally {
      state.isProcessing = false;
    }
  }
};

const validarMaterial = async (values) => {
  const response = await axiosInstance.post("/materiais/validar", values);
  return { isValid: true }; // Retorna sucesso  
};

// Configuração para máscara de moeda
const moneyConfig = {
  masked: false,
  currency: 'BRL',
  precision: 2,
  thousands: '.',
  decimal: ',',
};



</script>
<template>
  <!--begin::App Main-->
  <main class="app-main"> <!--begin::App Content Header-->
    <div class="app-content-header"> <!--begin::Container-->
      <div class="container-fluid"> <!--begin::Row-->
        <div class="row"> <!--begin::Col-->
          <div class="col-lg-6">
            <h5 class="mb-0">Cadastro</h5>
          </div> <!--end::Col--> <!--begin::Col-->
          <div class="col-lg-6">
            <ol class="breadcrumb float-sm-end">
              <li class="breadcrumb-item">Cadastros</li>
              <li class="breadcrumb-item active" aria-current="page">
                Pessoas
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Materiais
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Material
              </li>
            </ol>
          </div> <!--end::Col-->
        </div> <!--end::Row-->
      </div> <!--end::Container-->
    </div> <!--end::App Content Header--> <!--begin::App Content-->
    <div class="app-content"> <!--begin::Container-->
      <div class="container-fluid"> <!--begin::Row-->
        <div class="row"> <!--begin::Col-->
          <div class="col-12">
            <!--begin::Form Validation-->
            <div class="card"> <!--begin::Header-->
              <div class="card-header">
                <div class="card-title">
                  <h5>{{ isEditMode ? 'Editar Material' : 'Novo Material' }}</h5>
                </div>
              </div> <!--end::Header--> <!--begin::Form-->
              <div v-if="state.isProcessing" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden"> Processando...</span>
                </div>
              </div>
              <div v-else>
                <Form @submit="onSubmit" :validation-schema="schema" :initial-values="state.material"
                  validate-on-change="false" validate-on-input="false" validate-on-blur="true">
                  <!--begin::Body-->
                  <div class="card-body my-4"> <!--begin::Row-->
                    <div class="row g-2">
                      <!--begin::Col-->
                      <div class="col-md-6 d-none">
                        <div class="row"> <label for="id" class="col-form-label col-lg-4">Id</label>
                          <div class="col-lg-8">
                            <Field as="input" id="id" name="id" type="text" class="form-control" :validateOnBlur="false"
                              :validateOnChange="false" :validateOnInput="false" :validateOnModelUpdate="false" />
                            <ErrorMessage name="id" class="text-danger" />
                          </div>
                        </div>
                      </div> <!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-md-6 px-5">
                        <div class="row"> <label for="nome" class="col-form-label col-lg-4">Nome</label>
                          <div class="col-lg-8">
                            <Field as="input" id="nome" name="nome" type="text" class="form-control" maxlength="50" />
                            <ErrorMessage name="nome" class="text-danger" />
                          </div>
                        </div>
                      </div> <!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-md-6 px-5">
                        <div class="row"> <label for="marca" class="col-form-label col-lg-4">Marca</label>
                          <div class="col-lg-8">
                            <Field as="input" id="marca" name="marca" type="text" class="form-control" maxlength="35" />
                            <ErrorMessage name="marca" class="text-danger" />
                          </div>
                        </div>
                      </div> <!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-md-6 px-5">
                        <div class="row"> <label for="unidade" class="col-form-label col-lg-4">Unidade</label>
                          <div class="col-lg-8">
                            <Field as="select" id="unidade" name="unidade" class="form-select" aria-label="Unidade">
                              <option value="m" disabled selected></option>
                              <option value="un">UNIDADE</option>
                              <option value="m">METRO</option>
                              <option value="m2">METRO QUADRADO</option>
                              <option value="l">LITRO</option>
                            </Field>
                            <ErrorMessage name="unidade" class="text-danger" />
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-md-6 px-5">
                        <div class="row"> <label for="preco" class="col-form-label col-lg-4">Preço</label>
                          <div class="col-lg-8">
                            <Field name="preco" v-slot="{ field, errors }">
                              <div class="input-group">
                                <span class="input-group-text">R$</span>
                                <Money3 :modelValue="field.value" @update:modelValue="field.onChange"
                                  v-bind="moneyConfig" class="form-control" />
                              </div>
                              <span class="text-danger">{{ errors[0] }}</span>
                            </Field>
                          </div>
                        </div>
                      </div> <!--end::Col-->
                      <!--begin::Col-->
                      <!--
                      <div class="col-md-6 px-5">
                        <div class="row"> <label for="estoque" class="col-form-label col-lg-4">Estoque</label>
                          <div class="col-lg-8">
                            <Field name="estoque" v-slot="{ field, errors }">
                              <Money3 :modelValue="field.value" @update:modelValue="field.onChange" v-bind="moneyConfig"
                                class="form-control" />
                              <span class="text-danger">{{ errors[0] }}</span>
                            </Field>
                          </div>
                        </div>
                      </div>--> <!--end::Col-->
                    </div> <!--end::Row-->
                  </div> <!--end::Body--> <!--begin::Footer-->
                  <div class="card-footer">
                    <div class="row m-2">
                      <div class="col-lg-6 text-center">
                        <RouterLink to="/materiais" class="nav-link"><button type="button"
                            class="btn btn-danger button-medium m-2"><i
                              class="bi bi-arrow-counterclockwise"></i>&nbsp;&nbsp;&nbsp;Voltar</button>
                        </RouterLink>
                      </div>
                      <div class="col-lg-6 text-center">
                        <button class="btn btn-success button-medium m-2" type="submit"><i
                            class="bi bi-floppy"></i>&nbsp;&nbsp;&nbsp;Salvar</button>
                      </div>
                    </div>
                  </div> <!--end::Footer-->
                </Form> <!--end::Form-->
              </div>
              <!--begin::JavaScript-->
            </div> <!--end::Form Validation-->
          </div>
        </div> <!--end::Row-->
      </div> <!--end::Container-->
    </div> <!--end::App Content-->
  </main> <!--end::App Main--> <!--begin::Footer-->
</template>
<style>
.loader {
  font-size: 3px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  margin-bottom: 5px;
  animation: mulShdSpin 0.5s infinite ease;
  transform: translateZ(0);
}

.dots-loader::after {
  content: " ";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888;
  animation: dots 1.5s infinite;
}

@keyframes mulShdSpin {

  0%,
  100% {
    box-shadow: 0em -2.6em 0em 0em #000000, 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2), 2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.5), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.7);
  }

  12.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.7), 1.8em -1.8em 0 0em #000000, 2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.5);
  }

  25% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.5), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.7), 2.5em 0em 0 0em #000000, 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }

  37.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.5), 2.5em 0em 0 0em rgba(0, 0, 0, 0.7), 1.75em 1.75em 0 0em #000000, 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }

  50% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2), 2.5em 0em 0 0em rgba(0, 0, 0, 0.5), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.7), 0em 2.5em 0 0em #000000, -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.2), -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }

  62.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2), 2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.5), 0em 2.5em 0 0em rgba(0, 0, 0, 0.7), -1.8em 1.8em 0 0em #000000, -2.6em 0em 0 0em rgba(0, 0, 0, 0.2), -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }

  75% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2), 2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.5), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.7), -2.6em 0em 0 0em #000000, -1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2);
  }

  87.5% {
    box-shadow: 0em -2.6em 0em 0em rgba(0, 0, 0, 0.2), 1.8em -1.8em 0 0em rgba(0, 0, 0, 0.2), 2.5em 0em 0 0em rgba(0, 0, 0, 0.2), 1.75em 1.75em 0 0em rgba(0, 0, 0, 0.2), 0em 2.5em 0 0em rgba(0, 0, 0, 0.2), -1.8em 1.8em 0 0em rgba(0, 0, 0, 0.5), -2.6em 0em 0 0em rgba(0, 0, 0, 0.7), -1.8em -1.8em 0 0em #000000;
  }
}
</style>