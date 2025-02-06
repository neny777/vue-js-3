<script setup>
import DataTables from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net-bs5';
import DataTablesButtonsHtml5 from 'datatables.net-buttons/js/buttons.html5';
import { redrawTable } from '@/composables/dataTablesUtils';
import { customDataTables } from '@/composables/customDataTables';
DataTables.use(DataTablesCore);
DataTables.use(DataTablesButtonsHtml5);
import { useRouter } from 'vue-router';
import { reactive, onMounted } from 'vue';
import axiosInstance from '@/axiosInstance';
import { showModal } from '@/composables/modalUtils';
import { showToast } from '@/composables/toastUtils';
const router = useRouter();
const state = reactive({
    materiais: [],
    isProcessing: false,
});
const fetchMateriais = async () => {
    try {
        state.isProcessing = true;
        const response = await axiosInstance.get('/materiais');
        state.materiais = response.data;
    } catch (error) {
        showToast("erro", "Erro ao carregar materiais");
    } finally {
        state.isProcessing = false;
    }
};
// Fetch options from the composable
const { options } = customDataTables();
// Delete a material
const deleteMaterial = async (id) => {
    const modal = showModal("Excluir Material", 'Confirma a exclusão do material?', async () => {
        try {
            state.isProcessing = true;
            await axiosInstance.delete(`/materiais/${id}`);
            state.materiais = state.materiais.filter(material => material.id !== id);
            redrawTable('list');
            // Mostrar toast de sucesso
            showToast("sucesso", "Material excluído com sucesso.");
        } catch (error) {
            // Mostrar toast de erro
            showToast("erro", "Não foi possível excluir o material.");
        } finally {
            state.isProcessing = false;
            modal.hide(); // Fecha o modal após a confirmação
        }
    });
};
onMounted(async () => {
    fetchMateriais();
});

const formatNumber = (value) => {
  if (!value) return "0";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
</script>
<template>
    <!--begin::App Main-->
    <main class="app-main"> <!--begin::App Content Header-->
        <div class="app-content-header"> <!--begin::Container-->
            <div class="container-fluid"> <!--begin::Row-->
                <div class="row"> <!--begin::Col-->
                    <div class="col-sm-6">
                        <h5 class="mb-0">Cadastro</h5>
                    </div> <!--end::Col--> <!--begin::Col-->
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-end">
                            <li class="breadcrumb-item">Cadastros</li>
                            <li class="breadcrumb-item active" aria-current="page">
                                Materiais
                            </li>
                        </ol>
                    </div> <!--end::Col-->
                </div> <!--end::Row-->
            </div> <!--end::Container-->
        </div> <!--end::App Content Header-->
        <!--begin::App Content-->
        <div class="app-content"> <!--begin::Container-->
            <div class="container-fluid"> <!--begin::Row-->
                <div class="row"> <!--begin::Col-->
                    <div class="col-12"> <!--begin::Card-->
                        <div class="card"> <!--begin::Card Header-->
                            <div class="card-header">
                                <!--begin::Card Title-->
                                <div class="card-title">
                                    <h5>Materiais</h5>
                                </div>
                                <!--end::Card Title-->
                                <!--begin::Add button-->
                                <RouterLink to="/material">
                                    <button type="button" class="btn btn-primary button-medium float-end"><i
                                            class="bi bi-plus"></i>&nbsp;&nbsp;&nbsp;Novo</button>
                                </RouterLink>
                                <!--end::Add button-->
                            </div> <!--end::Card Header--> <!--begin::Card Body-->
                            <div class="card-body"> <!--begin::Row-->
                                <div class="row"> <!--begin::Col-->
                                    <div class="col-md-12">
                                        <!-- Table for materiais -->
                                        <div class="table-responsive p-2">
                                            <!-- Show loading spinner while loading is true -->
                                            <div v-if="state.isProcessing" class="text-center">
                                                <DataTables id="list" :options="options"
                                                    class="display table table-bordered table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>Processando ...</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div class="spinner-border text-primary" role="status">
                                                                    <span class="visually-hidden">Processando ...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </DataTables>
                                            </div>
                                            <!-- Shoe material listing when done loading -->
                                            <div v-else>
                                                <DataTables id="list" :options="options"
                                                    class="display table table-bordered table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th class="d-none">id</th>
                                                            <th>Nome</th>
                                                            <th>Marca</th>
                                                            <th>Unidade</th>
                                                            <th>Preço</th>
                                                            
                                                            <th class="text-center">Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="(material, index) in state.materiais"
                                                            :key="material.id">
                                                            <td class="d-none">{{ material.id }}</td>
                                                            <td>{{ material.nome }}</td>
                                                            <td>{{ material.marca }}</td>
                                                            <td>{{ material.unidadeDescricao }}</td>
                                                            <td>R$&nbsp;&nbsp;&nbsp;{{ formatNumber(material.preco) }}</td>
                                                            <!--<td>{{ formatNumber(material.estoque) }}&nbsp;&nbsp;&nbsp;{{ material.unidadeDescricao }}</td>-->
                                                            <td class="text-center">
                                                                <button class="btn btn-primary btn-sm mx-2"
                                                                    @click="$router.push({ name: 'material', params: { materialId: material.id } })"><i
                                                                        class="bi bi-pen"></i></button>
                                                                <button class="btn btn-danger btn-sm mx-2"><i
                                                                        class="bi bi-trash"
                                                                        @click="deleteMaterial(material.id)"></i></button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </DataTables>
                                            </div>
                                        </div>
                                    </div> <!--end::Col-->
                                </div> <!--end::Row-->
                            </div> <!--end::Card Body--> <!--begin::Card Footer-->
                            <div class="card-footer text-center">
                                <button type="button" class="btn btn-primary button-medium m-2"><i
                                        class="bi bi-arrow-counterclockwise"></i>&nbsp;&nbsp;&nbsp;Voltar</button>
                            </div> <!--end::Card Footer-->
                        </div> <!--end::Card--> <!--begin::Card-->
                    </div> <!--end::Col-->
                </div> <!--end::Row-->
            </div> <!--end::Container-->
        </div> <!--end::App Content-->
    </main> <!--end::App Main--> <!--begin::Footer-->
</template>