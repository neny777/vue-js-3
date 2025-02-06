<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Form, Field, ErrorMessage } from 'vee-validate';
import '@/composables/custom-vee-validate';
import * as yup from 'yup';
import { showModal } from '@/composables/modalUtils';
import { showToast } from '@/composables/toastUtils';
import axiosInstance from '@/axiosInstance';
// Validation schema
const schema = yup.object({
  colaborador: yup.string().required('Selecione um colaborador.'),
});
// State
const route = useRoute();
const router = useRouter();
const isEditMode = ref(!!route.params.usuarioId);
// Função para verificar alterações
const hasChanges = (newValues) => {
  return JSON.stringify(newValues) !== JSON.stringify(state.usuario);
};
const state = reactive({
  usuario: {},
  colaborador: '',
  identificacao: '',
  isProcessing: false,
});
const colaboradores = ref([]);
// Fetch Colaboradores
onMounted(async () => {
  try {
    state.isProcessing = true;
    if (isEditMode.value) {
      const response = await axiosInstance.get(`/usuarios/${route.params.usuarioId}`);
      state.usuario = response.data;
      colaboradores.value = [state.usuario.colaborador];
      state.usuario.colaborador = colaboradores.value.length > 0 ? colaboradores.value[0].id : "";
    } else {
      const response = await axiosInstance.get('/colaboradores/nao-usuario');
      colaboradores.value = response.data;
    }
  } catch (error) {
    showToast("erro", "Erro ao carregar dados.");
  } finally {
    state.isProcessing = false;
  }
});
const onSubmit = async (values, { resetForm }) => {
  try {
    const payload = {
      id: values.colaborador, // ID do usuário ou colaborador
      permissoes: values.permissoes, // Permissões selecionadas
    };
    if (isEditMode.value) {
      // Verifica se houve alterações nos valores do formulário
      if (hasChanges(values)) {
        // Abre o modal de confirmação no modo de edição
        const modal = showModal(
          "Editar Usuário",
          "Confirma a edição do Usuario?",
          async () => {
            try {
              state.isProcessing = true;
              await axiosInstance.put('/usuarios', payload);
              showToast("sucesso", "Usuário editado com sucesso!");
              resetForm();
              router.push('/usuarios');
            } catch (error) {
              if (error.response && error.response.data) {
                const { message, errorType } = error.response.data;
              } else {
                console.error(error);
                showToast("erro", "Erro inesperado ao processar a solicitação.");
              }
            } finally {
              state.isProcessing = false;
              modal.hide(); // Fecha o modal
            }
          }
        );
      } else {
        showToast("info", "Não houve alterações no usuário.");
      }
    } else {
      if (!values.colaborador) {
        showToast("erro", "Erro: Colaborador não selecionado.");
        return;
      }
      await axiosInstance.post('/usuarios', payload);
      showToast("sucesso", "Usuário criado com sucesso!");
      resetForm();
      router.push('/usuarios');
    }
  } catch (error) {
    showToast("erro", "Erro ao salvar usuário.");
  }
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
                Usuários
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                Usuário
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
                  <h5>{{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}</h5>
                </div>
              </div> <!--end::Header--> <!--begin::Form-->
              <div v-if="state.isProcessing" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden"> Processando...</span>
                </div>
              </div>
              <div v-else>
                <Form @submit="onSubmit" :validation-schema="schema" :initial-values="state.usuario">
                  <!--begin::Body-->
                  <div class="card-body my-4"> <!--begin::Row-->
                    <div class="row g-3 p-3">
                      <!--begin::Col-->
                      <div class="row p-2"> <label for="colaborador" class="col-form-label col-lg-2">Colaborador</label>
                        <div class="col-lg-10">
                          <Field as="select" id="colaborador" name="colaborador" class="form-select"
                            aria-label="Colaborador">
                            <option v-for="colaborador in colaboradores" :key="colaborador.id" :value="colaborador.id">
                              {{ colaborador.nome + ' - ' + colaborador.email + ' - ' + colaborador.telefone }}
                            </option>
                          </Field>
                          <ErrorMessage name="colaborador" class="text-danger" />
                        </div>
                      </div>
                      <!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-12 text-center p-2">
                        <div class="form-check">
                          <h5>Permissões</h5>
                          <ErrorMessage name="permissoes" class="text-danger" />
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_home" name="permissoes" type="checkbox" value="ROLE_home"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">
                              Home
                            </label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_colaboradores" name="permissoes" type="checkbox" value="ROLE_colaboradores"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">
                              Colaboradores
                            </label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_clientes" name="permissoes" type="checkbox" value="ROLE_clientes"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">Clientes</label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_fornecedores" name="permissoes" type="checkbox" value="ROLE_fornecedores"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">Fornecedores</label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_parceiros" name="permissoes" type="checkbox" value="ROLE_parceiros"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">Parceiros</label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_usuarios" name="permissoes" type="checkbox" value="ROLE_usuarios"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">
                              Usuários
                            </label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_materiais" name="permissoes" type="checkbox" value="ROLE_materiais"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">
                              Materiais
                            </label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                      <!--begin::Col-->
                      <div class="col-lg-6 px-3">
                        <div class="card">
                          <div class="card-body">
                            <Field id="ROLE_produtos" name="permissoes" type="checkbox" value="ROLE_produtos"
                              class="form-check-input mx-2" />
                            <label class="form-check-label mx-2" for="invalidCheck">
                              Produtos
                            </label>
                          </div>
                        </div>
                      </div><!--end::Col-->
                    </div> <!--end::Row-->
                  </div> <!--end::Body--> <!--begin::Footer-->
                  <div class="card-footer">
                    <div class="row m-2">
                      <div class="col-lg-6 text-center">
                        <RouterLink to="/usuarios" class="nav-link"><button type="button"
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
