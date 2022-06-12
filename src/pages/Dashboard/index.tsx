import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { Food as FoodInterface } from '../../types';

type FoodInput = Omit<FoodInterface, 'id' | 'available'>;

const Dashboard = (): JSX.Element => {
  const [foods, setFoods] = useState<FoodInterface[]>([]);
  const [editingFood, setEditingFood] = useState<FoodInterface>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const loadFoods = async (): Promise<void> => {
      setFoods(await (await api.get<FoodInterface[]>('/foods')).data);
    }

    loadFoods();
  }, []);

  const handleAddFood = async (foodData: FoodInput): Promise<void> => {
    try {
      const createdFood = await (await api.post('/foods', {
        ...foodData,
        available: true,
      })).data;

      setFoods([...foods, createdFood]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteFood = async (foodId: number): Promise<void> => {
    await api.delete(`/foods/${foodId}`);

    const foodsFiltered = foods.filter(food => food.id !== foodId);
    setFoods(foodsFiltered);
  };

  const handleUpdateFood = async (foodData: FoodInput): Promise<void> => {
    try {
      const foodUpdated = await (await api.put(
        `/foods/${editingFood?.id}`, { ...editingFood, ...foodData },)).data;

      const foodsUpdated = foods
        .map((food) => food.id !== foodUpdated.id ? food : foodUpdated,);

      setFoods(foodsUpdated);
    } catch(err) {
      console.log(err);
    }
  };

  const handleEditFood = (foodData: FoodInterface): void => {
    setEditingFood(foodData);
    setEditModalOpen(true);
  }

  const toggleModal = (): void => {
    setModalOpen(!modalOpen);
  }

  const toggleEditModal = (): void => {
    setEditModalOpen(!editModalOpen);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
